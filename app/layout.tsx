import type React from "react";
import type { Metadata, Viewport } from "next";
import { Amiri } from "next/font/google";
import { AppWrapper } from "@/components/app-wrapper";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "Made with App Studio",
  description: "مدار - منصة إخبارية عربية للعملات الرقمية والاقتصاد الرقمي",
    generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: "#0f1e3d",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`bg-background ${amiri.variable}`}>
      <body className="font-serif antialiased">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
