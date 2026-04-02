import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://i-ntroduce.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "연결의 숲",
    template: "%s | 연결의 숲",
  },
  description:
    "생각이 나무처럼 자라고 이야기가 숲을 이루는 곳 — 마크다운 서사 소셜 플랫폼",
  keywords: ["마크다운", "소셜 플랫폼", "생각 정리", "연결의 숲", "노트", "서사"],
  authors: [{ name: "연결의 숲" }],
  creator: "연결의 숲",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "연결의 숲",
    title: "연결의 숲",
    description:
      "생각이 나무처럼 자라고 이야기가 숲을 이루는 곳 — 마크다운 서사 소셜 플랫폼",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "연결의 숲 — 마크다운 서사 소셜 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "연결의 숲",
    description:
      "생각이 나무처럼 자라고 이야기가 숲을 이루는 곳 — 마크다운 서사 소셜 플랫폼",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">{children}</body>
    </html>
  );
}
