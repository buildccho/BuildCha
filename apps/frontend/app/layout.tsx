import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthInitializer } from "@/components/auth/authInitializer";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BuildCha(ビルチャ)",
    template: "%s | BuildCha(ビルチャ)",
  },
  description: "小中学生向け AIと話してまちづくりをはじめよう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
