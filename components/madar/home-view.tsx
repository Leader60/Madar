"use client";
import { useEffect, useRef, useState } from "react";
import { useMadar } from "@/contexts/madar-context";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import { formatDate, type Article } from "@/lib/madar/data";
import { Card, ThumbArt, SectionTitle, Pill, Button } from "./ui";
import { IconChevronLeft, IconClock, IconUser } from "./icons";
import { PaymentPrompt } from "./payment-prompt";

const SUBSCRIPTION_PRODUCT_ID = PRODUCT_CONFIG.PRODUCT_6a52cc8c0533b18091489818;

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
        <div className="mb-1 flex items-center gap-2">
          <Pill className="px-2 py-0.5 text-[10px]">{article.category}</Pill>
          {article.author?.name && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <IconUser size={11} />
              {article.author.name}
            </span>
          )}
        </div>
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

function LockedRecentSection({
  onSubscribeClick,
}: {
  onSubscribeClick: () => void;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 p-6 text-center">
      <p className="text-sm font-bold text-navy">
        باقي المقالات متاحة للمشتركين فقط
      </p>
      <p className="text-xs text-muted-foreground">
        اشترك الآن للوصول الكامل لجميع المقالات والتحديثات
      </p>
      <Button variant="gold" onClick={onSubscribeClick} className="mt-1">
        اشترك الآن
      </Button>
    </Card>
  );
}

function AllArticlesDropdown({ articles }: { articles: Article[] }) {
  const { navigate } = useMadar();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = query.trim()
    ? articles.filter((a) => a.title.toLowerCase().includes(query.trim().toLowerCase()))
    : articles;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full border border-gold px-3 py-1 text-xs font-bold text-gold-deep transition-colors hover:bg-gold hover:text-accent-foreground"
      >
        جميع المقالات
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1.5 3L5 6.5L8.5 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full z-30 mt-2 w-72 max-w-[85vw] overflow-hidden rounded-lg border border-border bg-background shadow-lg start-0">
          <div className="border-b border-border p-2">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مقال..."
              className="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-foreground outline-none focus:border-gold"
            />
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    navigate("article", a.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="block w-full border-b border-border/60 px-3 py-2 text-start text-xs leading-snug text-foreground hover:bg-secondary last:border-b-0"
                >
                  {a.title}
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                لا توجد نتائج
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function HomeView() {
  const { articles, navigate } = useMadar();
  const { sdk, restoredPurchases } = usePiAuth();
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const featured = articles[0];
  const MAX_RECENT = 4;
  const rest = articles.slice(1, 1 + MAX_RECENT);
  const hasMore = articles.length > 1 + MAX_RECENT;

  const isPiUser = sdk !== null;
  const isSubscribed =
    restoredPurchases?.some(
      (p) => p.productId === SUBSCRIPTION_PRODUCT_ID && p.quantity > 0,
    ) ?? false;
  const isLocked = isPiUser && restoredPurchases !== null && !isSubscribed;

  if (!featured) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">لا توجد مقالات منشورة بعد</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <div className="mb-3 flex items-center gap-2">
        <AllArticlesDropdown articles={articles} />
        <button
          onClick={() => setSubscribeOpen(true)}
          className="rounded-full border border-gold px-3 py-1 text-xs font-bold text-gold-deep transition-colors hover:bg-gold hover:text-accent-foreground"
        >
          اشتراك
        </button>
      </div>

      <div className="mb-3">
        <SectionTitle>المقال الرئيسـي</SectionTitle>
      </div>
      <FeaturedCard article={featured} />

      <SectionTitle className="mb-3 mt-8">أحدث المقالات</SectionTitle>

      {isLocked ? (
        <LockedRecentSection onSubscribeClick={() => setSubscribeOpen(true)} />
      ) : rest.length > 0 ? (
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

      {!isLocked && hasMore && (
        <Button
          variant="gold"
          className="mt-4 w-full"
          onClick={() => navigate("archive")}
        >
          عرض جميع المقالات بالأرشيف
        </Button>
      )}

      <PaymentPrompt
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
    </div>
  );
}
