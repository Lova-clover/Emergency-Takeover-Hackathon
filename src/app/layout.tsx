import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR, Space_Grotesk } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { UserProvider } from '@/context/UserContext';
import CommandPalette from '@/components/CommandPalette';
import './globals.css';

const bodyFont = Noto_Sans_KR({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const headingFont = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Emergency Takeover Room',
    template: '%s | Emergency Takeover Room',
  },
  description: '긴급 인수인계 해커톤을 위해 명세, 웹 캠프, 순위, 제출 규모 흐름을 하나로 엮성한 서비스로 정리한 애플리케이션 웹앱입니다.',
  keywords: ['긴급 인수인계', '해커톤', 'DAKER', 'Vercel', '웹 캠프', '순위', '제출 규모'],
  authors: [{ name: 'Emergency Takeover Team' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Emergency Takeover Room',
    title: 'Emergency Takeover Room',
    description: '명세서만 보고도 바로 이해하는 긴급 인수인계 해커톤 제출물',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f4ec' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${bodyFont.variable} ${headingFont.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] font-sans text-[var(--fg)] antialiased transition-colors">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
        >
          본문으로 건너뛰기
        </a>
        <UserProvider>
          <ToastProvider>
            <CommandPalette />
            <Header />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
