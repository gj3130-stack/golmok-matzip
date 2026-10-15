import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL('https://golmok-matzip-app.vercel.app'),
  title: '골목맛집 - 우리 동네 맛집 지도',
  description: '내 주변 500m·1km·3km 안의 음식점과 카페를 지도로 바로 찾아보세요.',
  openGraph: { siteName: '골목맛집', locale: 'ko_KR', type: 'website' },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover', // iPhone notch / home indicator safe area
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-100">{children}</body>
    </html>
  );
}
