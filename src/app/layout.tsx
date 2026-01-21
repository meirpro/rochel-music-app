import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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
        className={`${fredoka.variable} font-fredoka antialiased bg-app text-white`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
