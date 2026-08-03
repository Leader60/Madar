"use client";
import { useMadar } from "@/contexts/madar-context";
import { formatDate, type Article } from "@/lib/madar/data";
import { Card, ThumbArt, SectionTitle, Pill, Button } from "./ui";
import { IconChevronLeft, IconClock } from "./icons";

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
      className="md-fade-up overflow-hidden"
    >
      <div className="w-full bg-secondary">
        <ArticleThumb
          article={article}
          className="max-h-72 w-full"
          fit="contain"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Pill>{article.category}</Pill>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconClock size={13} />
            {formatDate(article.publishedAt)}
          </span>
        </div>
        <h2 className="mb-2 text-xl font-bold leading-snug text-navy text-balance">
          {article.title}
        </h2>
        <p className="md-clamp-3 text-sm leading-relaxed text-foreground/80">
          {article.excerpt}
        </p>
        <Button variant="gold" className="mt-3 w-full">
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
      className="md-fade-up flex gap-3 overflow-hidden p-3"
    >
      <ArticleThumb
        article={article}
        className="h-20 w-20 shrink-0 rounded-md"
      />
      <div className="min-w-0 flex-1">
        <h3 className="md-clamp-2 mb-1 text-sm font-bold leading-snug text-navy">
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
  const { articles } = useMadar();
  const featured = articles[0];
  const rest = articles.slice(1, 4);

  if (!featured) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">لا توجد مقالات منشورة بعد</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <SectionTitle className="mb-3">الخبر الرئيسي</SectionTitle>
      <FeaturedCard article={featured} />
      <SectionTitle className="mb-3 mt-8">أحدث المقالات</SectionTitle>
      <div className="flex flex-col gap-3">
        {rest.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
