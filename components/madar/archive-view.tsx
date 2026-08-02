"use client";

import { useEffect, useState } from "react";
import { useMadar } from "@/contexts/madar-context";
import { getArchiveArticles, Article } from "@/lib/articles";
import { formatDate } from "@/lib/madar/data";
import { Card, ThumbArt, SectionTitle, Pill } from "./ui";
import { IconClock } from "./icons";

export function ArchiveView() {
  const { navigate } = useMadar();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArchive() {
      try {
        const data = await getArchiveArticles();
        setArticles(data);
      } catch (error) {
        console.error("خطأ في جلب أرشيف المقالات:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArchive();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <SectionTitle className="mb-1">أرشيف المقالات</SectionTitle>
      <p className="mb-4 mr-4 text-sm text-muted-foreground">
        جميع المقالات المنشورة مرتبة من الأحدث إلى الأقدم
      </p>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          جاري تحميل أرشيف المقالات...
        </div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          لا توجد مقالات في الأرشيف حالياً.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((a) => (
            <Card
              key={a.id}
              onClick={() => navigate("article", a.id)}
              className="md-fade-up flex gap-3 overflow-hidden p-3"
            >
              <ThumbArt hue={(a as any).thumbHue || 200} className="h-24 w-24 shrink-0 rounded-md" />
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
                  {a.summary}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
