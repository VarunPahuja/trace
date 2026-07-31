// master.md §15 — share links.
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

export interface SharePayload {
  code: string;
  input: string;
  exampleId?: string;
}

const MAX_COMPRESSED_CHARS = 8 * 1024;

export function encodeSharePayload(payload: SharePayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Returns null for anything malformed or oversized — the /v page shows a
 * designed error and offers a blank workspace rather than crashing. */
export function decodeSharePayload(encoded: string): SharePayload | null {
  if (!encoded || encoded.length > MAX_COMPRESSED_CHARS) return null;
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed: unknown = JSON.parse(json);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as SharePayload).code !== "string" ||
      typeof (parsed as SharePayload).input !== "string"
    ) {
      return null;
    }
    return parsed as SharePayload;
  } catch {
    return null;
  }
}
