import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { Header } from "@/components";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kids Music Teaching App - 3-Line Treble Staff",
  description:
    "Learn music with a simplified 3-line staff, color-coded notes, and interactive playback",
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
        <Header />
        {children}
      </body>
    </html>
  );
}
