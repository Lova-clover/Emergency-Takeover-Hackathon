import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import CommandPalette from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "DAKER - AI 서비스개발 히어로의 여정",
  description: "데이콘(DACON) 데이터 경진대회를 위한 팀 빌딩 플랫폼. AI/ML 전문가들과 팀을 구성하고, 실력있는 팀원을 찾아 함께 대회에 참여하세요.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "DAKER - AI 서비스개발 히어로의 여정",
    description: "데이콘(DACON) 데이터 경진대회를 위한 팀 빌딩 플랫폼",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ToastProvider>
          <Header />
          <CommandPalette />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
