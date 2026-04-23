import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CaptchaProvider from "./components/CaptchaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ 메타데이터 복구 (이제 에러 안 남)
export const metadata: Metadata = {
  title: "Dilema - Tu Elección",
  description: "Vota por tu opción favorita",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 광고 및 알림 스크립트 틀 보존 */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 캡차 프로바이더로 children만 감싸줌 */}
        <CaptchaProvider>
          {children}
        </CaptchaProvider>
      </body>
    </html>
  );
}