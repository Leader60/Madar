"use client";

import Image from "next/image";
import { useMadar } from "@/contexts/madar-context";
import { FOOTER_LINKS } from "@/lib/madar/data";

export function SiteFooter() {
  const { navigate } = useMadar();

  const links = FOOTER_LINKS;
  return (
    <footer className="mt-10 md-safe-bottom">
      {/* primary-colored ticker with the static-page links */}
      <div className="flex items-stretch overflow-hidden bg-navy-deep text-primary-foreground">
        <div className="flex shrink-0 items-center bg-gold px-3 text-xs font-bold text-accent-foreground">
          روابط
        </div>
        <div className="relative flex-1 overflow-hidden py-2">
          <div className="md-ticker-track px-4">
            {[0, 1].map((rep) => (
              <span key={rep} className="inline-flex items-center gap-4 px-4">
                {links.map((l) => (
                  <button
                    key={`${rep}-${l.route}`}
                    onClick={() => navigate(l.route)}
                    className="text-sm font-bold text-gold hover:underline"
                  >
                    {l.label}
                  </button>
                ))}
                <span aria-hidden="true" className="text-primary-foreground/50">
                  •
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* footer base */}
      <div className="bg-navy px-4 py-5 text-center text-primary-foreground">
        {/* استبدال الأيقونة باللوغو الدائري */}
        <div className="mb-2 flex items-center justify-center gap-2 text-gold">
          <div className="relative h-7 w-7 overflow-hidden rounded-full border border-gold bg-navy-deep">
            <Image
              src="/Madar_logo.png"
              alt="لوغو مدار"
              width={28}
              height={28}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-lg font-bold">مدار</span>
        </div>
        
        <p className="text-xs text-primary-foreground/70">
          منصة إخبارية عربية للعملات الرقمية وشبكة باي والاقتصاد الرقمي العالمي
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
          <button
            onClick={() => navigate("about")}
            className="text-gold hover:underline"
          >
            من نحن
          </button>
          <button
            onClick={() => navigate("contact")}
            className="text-gold hover:underline"
          >
            اتصل بنا
          </button>
          <button
            onClick={() => navigate("privacy")}
            className="text-gold hover:underline"
          >
            الخصوصية والأمان
          </button>
          <button
            onClick={() => navigate("terms")}
            className="text-gold hover:underline"
          >
            شروط الاستخدام
          </button>
        </div>
      </div>
    </footer>
  );
}
