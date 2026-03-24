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

// ✅ 메타데이터는 한 번만!
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
        {/* 🔔 1. 푸시 알림 태그 (알림 허용) */}
        <script src="https://5gvci.com/act/files/tag.min.js?z=10781241" data-cfasync="false" async></script>

        {/* 💰 2. 전면 광고 태그 (Vignette) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(s){s.dataset.zone='10781221',s.src='https://izcle.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}