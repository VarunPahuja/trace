import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sync your tracker across devices. Everything else works without an account.",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
