import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import MobileBanner from "@/components/MobileBanner";
import MotionConfigProvider from "@/components/MotionConfigProvider";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TRACE — watch your code think",
  description:
    "Paste Python, press Visualize, and watch DSA algorithms execute step by step with real, animated traces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-paper text-ink">
        <MotionConfigProvider>
          <TopBar />
          <MobileBanner />
          <main className="flex-1 flex flex-col">{children}</main>
        </MotionConfigProvider>
      </body>
    </html>
  );
}
