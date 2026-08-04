"use client";

import { useState } from "react";
import Image from "next/image";
import { useMadar } from "@/contexts/madar-context";
import { TICKER_HEADLINES, type RouteName } from "@/lib/madar/data";
import { cx } from "./ui";
import { PaymentPrompt } from "./payment-prompt";
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
  { label: "أرشيف", route: "archive", icon: IconArticles },
  { label: "من نحن", route: "about", icon: IconInfo },
  { label: "اتصل بنا", route: "contact", icon: IconMail },
];

function NewsTicker() {
  const { articles } = useMadar();

  const headlines =
    articles.length > 0 ? articles.map((a) => a.title) : [...TICKER_HEADLINES];
  const line = headlines.join("   •   ");

  return (
    <div className="flex items-stretch overflow-hidden border-t border-gold/30 bg-navy-deep text-primary-foreground">
      <div className="flex shrink-0 items-center gap-1.5 bg-gold px-3 text-accent-foreground z-10">
        <span className="h-2 w-2 animate-pulse rounded-full bg-navy-deep" />
        <span className="text-xs font-bold">عاجل</span>
      </div>
      <div className="relative flex-1 overflow-hidden py-1.5">
        <div className="md-ticker-track px-4 text-sm">
          <span>{line}</span>
          <span className="px-4" aria-hidden="true">•</span>
          <span aria-hidden="true">{line}</span>
          <span className="px-4" aria-hidden="true">•</span>
          <span aria-hidden="true">{line}</span>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { route, navigate } = useMadar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const go = (r: RouteName) => {
    navigate(r);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 shadow-md">
      <div className="w-full overflow-hidden bg-navy text-primary-foreground shadow-lg">
        <div className="relative flex items-center justify-between px-4 py-2.5">
          {/* menu button (mobile) + subscribe button (mobile only, always visible) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md p-1.5 text-gold hover:bg-white/10"
              aria-label="القائمة"
            >
              {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
            </button>
            <button
              onClick={() => setSubscribeOpen(true)}
              className="rounded-full border border-gold px-2.5 py-1 text-xs font-bold text-gold transition-colors hover:bg-gold hover:text-accent-foreground"
            >
              اشتراك
            </button>
          </div>

          {/* desktop nav — بدون زر اشتراك هنا، تفادياً للتراكب مع اسم الموقع بالمنتصف */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.route}
                  onClick={() => go(item.route)}
                  className={cx(
                    "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-bold transition-colors",
                    route === item.route
                      ? "bg-gold text-accent-foreground"
                      : "text-primary-foreground hover:bg-white/10",
                  )}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* centered platform name */}
          <button
            onClick={() => go("home")}
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xl font-bold tracking-tight text-gold sm:text-2xl"
          >
            مدار <span className="text-gold/60">-</span> Madar
          </button>

          {/* اللوغو */}
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

        <NewsTicker />

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

      <PaymentPrompt
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
    </header>
  );
}
