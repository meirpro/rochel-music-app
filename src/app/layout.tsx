import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Fredoka is self-hosted via @font-face rules in globals.css — keeping the
// --font-fredoka variable name lets the existing Tailwind/global styles keep
// working unchanged.

export const metadata: Metadata = {
  title: {
    default: "Rochel's Piano School - The Batya Method",
    template: "%s | Rochel's Piano School",
  },
  description:
    "Learn piano from zero to hero with The Batya Method! A step-by-step piano course for kids using a simplified 3-line staff, color-coded notes, and interactive playback.",
  keywords: [
    "learn piano",
    "piano for beginners",
    "kids piano lessons",
    "piano course",
    "music education",
    "treble clef",
    "music notation",
    "piano for children",
    "batya method",
    "piano teacher",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-fredoka antialiased bg-app text-white"
        style={{ ["--font-fredoka" as string]: "Fredoka" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
