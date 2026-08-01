"use client";

import { useState } from "react";
import Image from "next/image";
import { useMadar } from "@/contexts/madar-context";
import { TICKER_HEADLINES, type RouteName } from "@/lib/madar/data";
import { cx } from "./ui";
import {
  IconMenu,
  IconClose,
  IconHome,
  IconArticles,
  IconInfo,
  IconMail,
} from "./icons";

const NAV: { label: string; route: RouteName; icon: typeof IconHome }[] = [
  { label: "الرئيسية", route: "home", icon: IconHome },
  { label: "المقالات", route: "archive", icon: IconArticles },
  { label: "من نحن", route: "about", icon: IconInfo },
  { label: "اتصل بنا", route: "contact", icon: IconMail },
];

function NewsTicker() {
  const headlines = [...TICKER_HEADLINES];
  const line = headlines.join("   •   ");
  return (
    <div className="flex items-stretch overflow-hidden border-t border-gold/30 bg-navy-deep text-primary-foreground">
      <div className="flex shrink-0 items-center gap-1.5 bg-gold px-3 text-accent-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-navy-deep" />
        <span className="text-xs font-bold">عاجل</span>
      </div>
      <div className="relative flex-1 overflow-hidden py-1.5">
        <div className="md-ticker-track px-4 text-sm">
          <span>{line}</span>
          <span className="px-4" aria-hidden="true">
            •
          </span>
          <span aria-hidden="true">{line}</span>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { route, navigate } = useMadar();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (r: RouteName) => {
    navigate(r);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 shadow-md">
      {/* 1- تجميع الهيدر والشريط المتحرك داخل حاوية واحدة محددة العرض (max-w-3xl) */}
      <div className="mx-auto max-w-3xl overflow-hidden bg-navy text-primary-foreground shadow-lg">
        
        {/* الجزء العلوي: القائمة، اسم الموقع، واللوغو */}
        <div className="relative flex items-center justify-between px-4 py-2.5">
          {/* menu button (mobile) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1.5 text-gold hover:bg-white/10 md:hidden"
            aria-label="القائمة"
          >
            {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <button
                key={item.route}
                onClick={() => go(item.route)}
                className={cx(
                  "rounded-md px-3 py-1.5 text-sm font-bold transition-colors",
                  route === item.route
                    ? "bg-gold text-accent-foreground"
                    : "text-primary-foreground hover:bg-white/10",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* centered platform name */}
          <button
            onClick={() => go("home")}
            className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-tight text-gold"
          >
            مدار
          </button>

          {/* 2- اللوغو في جهة اليمين باستخدام Madar_logo.png */}
          <button
            onClick={() => go("home")}
            className="flex items-center gap-2 text-gold"
            aria-label="مدار"
          >
            <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-gold bg-navy-deep">
              <Image
                src="/Madar_logo.png"
                alt="لوغو مدار"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </button>
        </div>

        {/* الشريط المتحرك (بنفس عرض الهيدر تمامًا) */}
        <NewsTicker />

        {/* mobile dropdown menu */}
        {menuOpen && (
          <nav className="md-fade-in border-t border-gold/20 bg-navy text-primary-foreground md:hidden">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.route}
                  onClick={() => go(item.route)}
                  className={cx(
                    "flex w-full items-center gap-3 px-5 py-3 text-right text-sm font-bold transition-colors",
                    route === item.route
                      ? "bg-gold text-accent-foreground"
                      : "hover:bg-white/10",
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
