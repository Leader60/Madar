"use client";

import { useMadar } from "@/contexts/madar-context";

export function ToastHost() {
  const { toasts, storageNotice } = useMadar();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {storageNotice && (
        <div className="md-fade-up rounded-md bg-navy-deep px-4 py-2 text-center text-xs font-bold text-gold shadow-lg">
          تعذّر حفظ التغييرات مؤقتًا، ستُحفظ تلقائيًا لاحقًا
        </div>
      )}
      {toasts.map((t) => (
        <div
          key={t.id}
          className="md-fade-up rounded-md bg-navy px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
