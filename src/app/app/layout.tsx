import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visualizer",
  description: "Paste Python, press Visualize, and watch it execute step by step with real, animated traces.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
