import type React from "react";
import type { Metadata, Viewport } from "next";
import { Amiri } from "next/font/google";
import Script from "next/script";
import { AppWrapper } from "@/components/app-wrapper";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "مدار - منصة إخبارية عربية",
  description: "مدار - منصة إخبارية عربية للعملات الرقمية والاقتصاد الرقمي",
  generator: "v0.app",
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
    <html lang="ar" dir="rtl" className={`bg-[#0f1e3d] ${amiri.variable}`}>
      <head>
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
      </head>
      {/* 
        1. جعلنا الـ body يوسط المحتوى في منتصف الشاشة (items-center) مع خلفية رمادية/فاتحة أو نفس لون الموقع
        2. أضفنا py-4 لخلق مسافة جمالية فوق وتحت التطبيق
      */}
      <body className="font-serif antialiased min-h-screen flex flex-col items-center bg-gray-100 dark:bg-slate-900 py-4 px-2">
        
        {/* 
          1. max-w-3xl: تقييد عرض الإطار ليكون بعرض التطبيق تماماً
          2. w-full: للتأكد من أنه يملأ الشاشة في الهواتف المحمولة
          3. border-[6px] border-gold rounded-[15px]: الإطار الذهبي 6px والانحناء 15px
        */}
        <div className="w-full max-w-3xl flex-1 flex flex-col border-[6px] border-gold rounded-[15px] overflow-hidden bg-background shadow-2xl relative">
          <AppWrapper>{children}</AppWrapper>
        </div>
        
      </body>
    </html>
  );
}
