"""TRACE tracer harness — master.md §7.

Fixed harness, written once, exec'd inside the Pyodide worker before any
user code runs. Defines __trace_run(source_code) -> str (JSON), which
compiles+execs the given Python source under sys.settrace and returns a
JSON-encoded TraceResult ({steps, truncated, error}) matching
src/lib/trace/types.ts.

Lives in /public (rather than src/lib/trace) because it's fetched at
runtime by the worker, the same way pyodide.js itself is — see the
comment in src/workers/pyodideWorker.ts for why bundling it via a JS
import isn't reliable under this app's Turbopack worker output.

Never invents steps: every recorded event corresponds to a real
sys.settrace callback firing during real execution of the given source.
"""

import sys
import time
import json
import builtins

_USER_FILENAME = "<user_code>"
_STEP_CAP = 3000
_WALLCLOCK_CAP_S = 8.0
_LIST_DEPTH_CAP = 4
_LINKEDLIST_NODE_CAP = 50
_TREE_NODE_CAP = 63


class _CapExceeded(Exception):
    pass


def __trace_run(source_code):
    steps = []
    call_stack = []
    node_registry = {}
    next_node_id = [0]
    start_time = time.perf_counter()
    truncated = [False]
    error = [None]

    def get_node_id(obj):
        key = id(obj)
        if key not in node_registry:
            node_registry[key] = next_node_id[0]
            next_node_id[0] += 1
        return node_registry[key]

    def serialize(value, depth=0):
        if value is None or isinstance(value, (bool, int, float, str)):
            return value
        if depth >= _LIST_DEPTH_CAP:
            return _opaque(value)
        if isinstance(value, (list, tuple)):
            return [serialize(v, depth + 1) for v in value]
        if isinstance(value, dict):
            return {
                "type": "dict",
                "entries": [[serialize(k, depth + 1), serialize(v, depth + 1)] for k, v in value.items()],
            }
        if isinstance(value, (set, frozenset)):
            return {"type": "set", "values": [serialize(v, depth + 1) for v in value]}
        if hasattr(value, "val") and hasattr(value, "next") and not hasattr(value, "left"):
            return serialize_linked_list(value)
        if hasattr(value, "val") and hasattr(value, "left") and hasattr(value, "right"):
            return serialize_tree(value)
        return _opaque(value)

    def _opaque(value):
        try:
            return {"type": "opaque", "repr": repr(value)[:40]}
        except Exception:
            return {"type": "opaque", "repr": "<unrepr-able>"}

    def serialize_linked_list(head):
        nodes = []
        visited = {}
        cur = head
        cycle_to = None
        count = 0
        while cur is not None and count < _LINKEDLIST_NODE_CAP:
            key = id(cur)
            if key in visited:
                cycle_to = visited[key]
                break
            node_id = get_node_id(cur)
            visited[key] = node_id
            nodes.append({"id": node_id, "val": serialize(getattr(cur, "val", None), 1)})
            cur = getattr(cur, "next", None)
            count += 1
        result = {"type": "linkedlist", "nodes": nodes}
        if cycle_to is not None:
            result["cycleTo"] = cycle_to
        return result

    def serialize_tree(root):
        nodes = []
        visited = {}
        root_id = get_node_id(root) if root is not None else None
        stack = [root] if root is not None else []
        while stack and len(nodes) < _TREE_NODE_CAP:
            node = stack.pop()
            key = id(node)
            if key in visited:
                continue
            node_id = get_node_id(node)
            visited[key] = node_id
            left = getattr(node, "left", None)
            right = getattr(node, "right", None)
            left_id = get_node_id(left) if left is not None else None
            right_id = get_node_id(right) if right is not None else None
            nodes.append(
                {
                    "id": node_id,
                    "val": serialize(getattr(node, "val", None), 1),
                    "left": left_id,
                    "right": right_id,
                }
            )
            if left is not None and id(left) not in visited:
                stack.append(left)
            if right is not None and id(right) not in visited:
                stack.append(right)
        return {"type": "tree", "nodes": nodes, "rootId": root_id}

    def snapshot_locals(frame):
        out = {}
        for name, val in frame.f_locals.items():
            if name.startswith("__"):
                continue
            try:
                out[name] = serialize(val)
            except Exception:
                out[name] = {"type": "opaque", "repr": "<serialize-error>"}
        return out

    def build_call_stack():
        return [{"fn": f.f_code.co_name, "line": f.f_lineno} for f in call_stack]

    def record(event, frame, returned_val=None, has_returned=False):
        if len(steps) >= _STEP_CAP:
            raise _CapExceeded()
        if time.perf_counter() - start_time > _WALLCLOCK_CAP_S:
            raise _CapExceeded()
        step = {
            "i": len(steps),
            "line": frame.f_lineno,
            "event": event,
            "depth": len(call_stack),
            "callStack": build_call_stack(),
            "locals": snapshot_locals(frame),
        }
        if has_returned:
            step["returned"] = serialize(returned_val)
        steps.append(step)

    def local_trace(frame, event, arg):
        if frame.f_code.co_filename != _USER_FILENAME:
            return None
        if event == "call":
            call_stack.append(frame)
            record("call", frame)
        elif event == "line":
            record("line", frame)
        elif event == "return":
            record("return", frame, arg, has_returned=True)
            if call_stack and call_stack[-1] is frame:
                call_stack.pop()
        return local_trace

    def global_trace(frame, event, arg):
        if frame.f_code.co_filename != _USER_FILENAME:
            return None
        return local_trace(frame, event, arg)

    compiled = compile(source_code, _USER_FILENAME, "exec")
    exec_globals = {"__name__": "__main__", "__builtins__": builtins}

    sys.settrace(global_trace)
    try:
        exec(compiled, exec_globals)
    except _CapExceeded:
        truncated[0] = True
    except Exception as e:
        tb = e.__traceback__
        err_line = None
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == _USER_FILENAME:
                err_line = tb.tb_lineno
            tb = tb.tb_next
        error[0] = {"message": "{}: {}".format(type(e).__name__, e), "line": err_line}
    finally:
        sys.settrace(None)

    return json.dumps({"steps": steps, "truncated": truncated[0], "error": error[0]})
