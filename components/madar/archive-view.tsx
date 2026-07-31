"use client";

import { useMadar } from "@/contexts/madar-context";
import { articlesByDate, formatDate } from "@/lib/madar/data";
import { Card, ThumbArt, SectionTitle, Pill } from "./ui";
import { IconClock } from "./icons";

export function ArchiveView() {
  const { navigate } = useMadar();
  const articles = articlesByDate();

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <SectionTitle className="mb-1">أرشيف المقالات</SectionTitle>
      <p className="mb-4 mr-4 text-sm text-muted-foreground">
        جميع المقالات المنشورة مرتبة من الأحدث إلى الأقدم
      </p>

      <div className="flex flex-col gap-3">
        {articles.map((a) => (
          <Card
            key={a.id}
            onClick={() => navigate("article", a.id)}
            className="md-fade-up flex gap-3 overflow-hidden p-3"
          >
            <ThumbArt hue={a.thumbHue} className="h-24 w-24 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Pill>{a.category}</Pill>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconClock size={12} />
                  {formatDate(a.publishedAt)}
                </span>
              </div>
              <h3 className="mb-1 text-sm font-bold leading-snug text-navy">
                {a.title}
              </h3>
              <p className="md-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {a.excerpt}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
