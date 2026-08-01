import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracker",
  description: "Log the problems you've solved — intuition, notes, time taken, difficulty. No account required.",
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
