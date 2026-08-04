"use client";
import { useMadar } from "@/contexts/madar-context";
import { formatDate, type Article } from "@/lib/madar/data";
import { Card, ThumbArt, SectionTitle, Button } from "./ui";
import { IconChevronLeft, IconClock, IconUser } from "./icons";

function ArticleThumb({
  article,
  className,
  fit = "cover",
}: {
  article: Article;
  className?: string;
  fit?: "cover" | "contain";
}) {
  if (article.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={article.imageUrl}
        alt={article.title}
        className={`${className ?? ""} ${
          fit === "contain" ? "object-contain" : "object-cover"
        }`}
      />
    );
  }
  return <ThumbArt hue={article.thumbHue} className={className} />;
}

function FeaturedCard({ article }: { article: Article }) {
  const { navigate } = useMadar();
  return (
    <Card
      onClick={() => navigate("article", article.id)}
      className="md-fade-up group overflow-hidden border border-navy/10 shadow-md transition-shadow duration-300 hover:shadow-xl"
    >
      {/* الصورة + طبقة تدرج داكنة تحمل التصنيف والتاريخ فوقها مباشرة */}
      <div className="relative w-full overflow-hidden bg-navy">
        <ArticleThumb
          article={article}
          className="max-h-80 w-full transition-transform duration-500 group-hover:scale-[1.03]"
          fit="contain"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent"
        />
        <div className="absolute inset-x-4 bottom-3 flex items-center gap-2">
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy shadow-sm">
            {article.category}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <IconClock size={12} />
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="mb-2.5 text-xl font-bold leading-snug tracking-tight text-navy text-balance">
          {article.title}
        </h2>
        <p className="md-clamp-3 mb-4 text-sm leading-relaxed text-foreground/70">
          {article.excerpt}
        </p>
        <Button
          variant="gold"
          className="w-full shadow-sm transition-transform duration-200 group-hover:translate-x-0"
        >
          اقرأ المقال كاملًا
          <IconChevronLeft size={16} />
        </Button>
      </div>
    </Card>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const { navigate } = useMadar();
  return (
    <Card
      onClick={() => navigate("article", article.id)}
      className="md-fade-up group flex gap-4 overflow-hidden border border-navy/8 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-navy/10">
        <ArticleThumb
          article={article}
          className="h-20 w-20 shrink-0 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center gap-2 text-[11px]">
          <span className="rounded-full bg-navy/8 px-2 py-0.5 font-bold text-navy">
            {article.category}
          </span>
          {article.author?.name && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <IconUser size={11} />
              {article.author.name}
            </span>
          )}
        </div>
        <h3 className="md-clamp-2 mb-1 text-sm font-bold leading-snug text-navy transition-colors group-hover:text-gold-deep">
          {article.title}
        </h3>
        <p className="md-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
      </div>
    </Card>
  );
}

export function HomeView() {
  const { articles, navigate } = useMadar();

  const featured = articles.find((a) => a.isFeatured) ?? articles[0];
  const others = articles.filter((a) => a.id !== featured?.id);

  const MAX_RECENT = 8;
  const rest = others.slice(0, MAX_RECENT);
  const hasMore = others.length > MAX_RECENT;

  if (!featured) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">لا توجد مقالات منشورة بعد</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <SectionTitle className="mb-4">الخبر الرئيسي</SectionTitle>
      <FeaturedCard article={featured} />

      <div className="my-8 border-t border-navy/10" />

      <SectionTitle className="mb-4">أحدث المقالات</SectionTitle>
      {rest.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rest.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">
          لا توجد مقالات إضافية بعد
        </p>
      )}
      {hasMore && (
        <Button
          variant="gold"
          className="mt-5 w-full shadow-sm"
          onClick={() => navigate("archive")}
        >
          عرض جميع المقالات بالأرشيف
        </Button>
      )}
    </div>
  );
}
