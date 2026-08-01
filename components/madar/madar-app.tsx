"use client";

import Image from "next/image";
import { MadarProvider, useMadar } from "@/contexts/madar-context";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { ToastHost } from "./toast-host";
import { HomeView } from "./home-view";
import { ArchiveView } from "./archive-view";
import { ArticleView } from "./article-view";
import {
  AboutView,
  ContactView,
  PrivacyView,
  TermsView,
} from "./static-views";

function LoadingScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-navy text-gold py-20">
      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gold md-spin">
        <Image
          src="/Madar_logo.png"
          alt="جارٍ التحميل..."
          fill
          className="object-cover"
        />
      </div>
      <p className="text-lg font-bold">جارٍ تحميل مدار...</p>
    </div>
  );
}

function AppInner() {
  const { ready, route, currentArticleId } = useMadar();

  if (!ready) return <LoadingScreen />;

  return (
    <div className="flex flex-1 flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {route === "home" && <HomeView />}
        {route === "archive" && <ArchiveView />}
        {route === "article" && currentArticleId && (
          <ArticleView articleId={currentArticleId} />
        )}
        {route === "about" && <AboutView />}
        {route === "contact" && <ContactView />}
        {route === "privacy" && <PrivacyView />}
        {route === "terms" && <TermsView />}
      </main>
      <SiteFooter />
      <ToastHost />
    </div>
  );
}

export function MadarApp() {
  return (
    <MadarProvider>
      <AppInner />
    </MadarProvider>
  );
}
