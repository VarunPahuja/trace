"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";

/** Mounted once in the root layout — subscribes the auth store to Supabase
 * session changes. Renders nothing; a no-op when unconfigured. */
export default function AuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
