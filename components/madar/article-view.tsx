"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useMadar } from "@/contexts/madar-context";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import {
  formatDate,
  timeAgo,
  toArabicNum,
  type Article,
} from "@/lib/madar/data";
import { Card, ThumbArt, Button, Pill, inputClass, cx } from "./ui";
import {
  IconChevronRight,
  IconThumbUp,
  IconThumbDown,
  IconSend,
  IconUser,
  IconClock,
} from "./icons";
import { PaymentPrompt } from "./payment-prompt";

const SUBSCRIPTION_PRODUCT_ID = PRODUCT_CONFIG.PRODUCT_6a52cc8c0533b18091489818;

function ShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
    </svg>
  );
}

function ShareButton({ article }: { article: Article }) {
  const { pushToast } = useMadar();

  const handleShare = async () => {
    const url = `${window.location.origin}/article/${encodeURIComponent(article.id)}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url,
        });
      } catch {
        // المستخدم ألغى المشاركة، لا داعي لأي إجراء
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      pushToast("تم نسخ رابط المقال");
    } catch {
      pushToast("تعذّر نسخ الرابط");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-full border border-navy/25 px-4 py-2 text-sm font-bold text-navy transition-colors hover:bg-secondary"
    >
      <ShareIcon size={18} />
      مشاركة
    </button>
  );
}

function AuthorBlock({ article }: { article: Article }) {
  return (
    <Card className="mt-8 p-4">
      <div className="mb-3 flex items-start gap-4">
        {article.author.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.author.imageUrl}
            alt={article.author.name}
            className="h-16 w-16 shrink-0 rounded-full border-2 border-gold object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-navy text-gold">
            <IconUser size={30} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-gold-deep">بقلم</span>
          <h3 className="text-lg font-bold text-navy">{article.author.name}</h3>
        </div>
      </div>
      {article.author.bio && (
        <div className="md-article-body text-sm leading-relaxed text-foreground/80 [&>p]:mb-2 [&>h3]:mb-1 [&>h3]:mt-3 [&>h3]:font-bold [&>h3]:text-navy [&>ul]:mb-2 [&>ul_strong]:text-gold-deep [&>blockquote]:my-2 [&>blockquote]:border-r-2 [&>blockquote]:border-gold [&>blockquote]:pr-3 [&>blockquote]:text-gold-deep [&>blockquote]:font-medium">
          <ReactMarkdown>{article.author.bio}</ReactMarkdown>
        </div>
      )}
    </Card>
  );
}

function ArticleVideo({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg bg-black">
      <video
        src={videoUrl}
        controls
        preload="metadata"
        className="w-full rounded-lg"
      />
    </div>
  );
}

function ReferencesTable({
  references,
}: {
  references: NonNullable<Article["references"]>;
}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-gold" />
        <h2 className="text-lg font-bold text-navy">المراجع والمصادر</h2>
      </div>
      <Card className="overflow-hidden p-0">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {references.map((ref, i) => {
              const rowClass = cx(
                "border-b border-border last:border-b-0",
                i % 2 === 1 && "bg-secondary/40",
              );
              const linkClass =
                "font-medium text-navy underline decoration-gold/50 underline-offset-2 transition-colors hover:text-gold-deep";
              return (
                <tr key={ref.url + i} className={rowClass}>
                  <td className="w-10 px-3 py-2.5 text-center align-top text-xs font-bold text-muted-foreground">
                    <span className="md-nums">{toArabicNum(i + 1)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={linkClass}
                    >
                      {ref.title}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function LikeBar({ articleId, article }: { articleId: string; article: Article }) {
  const { isLiked, likeCount, toggleLike } = useMadar();
  const [disliked, setDisliked] = useState(false);
  const liked = isLiked(articleId);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        onClick={() => toggleLike(articleId)}
        className={cx(
          "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors",
          liked
            ? "border-gold bg-gold text-accent-foreground"
            : "border-navy/25 text-navy hover:bg-secondary",
        )}
        aria-pressed={liked}
      >
        <span className={liked ? "md-pop inline-flex" : "inline-flex"}>
          <IconThumbUp size={18} />
        </span>
        <span className="md-nums">{toArabicNum(likeCount(articleId))}</span>
      </button>

      <button
        onClick={() => {
          setDisliked((v) => !v);
          if (liked) toggleLike(articleId);
        }}
        className={cx(
          "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors",
          disliked
            ? "border-destructive bg-destructive text-destructive-foreground"
            : "border-navy/25 text-navy hover:bg-secondary",
        )}
        aria-pressed={disliked}
      >
        <IconThumbDown size={18} />
      </button>

      <ShareButton article={article} />

      <span className="mr-auto text-xs text-muted-foreground">
        شاركنا رأيك في المقال
      </span>
    </div>
  );
}

function CommentSection({ articleId }: { articleId: string }) {
  const { commentsFor, addComment, profile, saveDisplayName } = useMadar();
  const [name, setName] = useState(profile.displayName);
  const [text, setText] = useState("");
  const comments = commentsFor(articleId);

  const submit = () => {
    if (!text.trim()) return;
    const finalName = name.trim() || "زائر";
    if (finalName !== profile.displayName) saveDisplayName(finalName);
    addComment(articleId, finalName, text);
    setText("");
  };

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-gold" />
        <h2 className="text-lg font-bold text-navy">
          التعليقات{" "}
          <span className="md-nums text-sm text-muted-foreground">
            ({toArabicNum(comments.length)})
          </span>
        </h2>
      </div>

      <Card className="p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسمك"
          maxLength={40}
          className={cx(inputClass, "mb-2")}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب تعليقك هنا..."
          maxLength={500}
          rows={3}
          className={cx(inputClass, "resize-none")}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              (e.metaKey || e.ctrlKey) &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229
            ) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <div className="mt-2 flex justify-end">
          <Button variant="primary" onClick={submit} disabled={!text.trim()}>
            نشر التعليق
            <IconSend size={16} />
          </Button>
        </div>
      </Card>

      <div className="mt-4 flex flex-col gap-3">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            كن أول من يعلّق على هذا المقال
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="md-fade-up rounded-md border border-border bg-card p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-gold">
                    <IconUser size={15} />
                  </span>
                  <span className="text-sm font-bold text-navy">{c.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap pr-9 text-sm leading-relaxed text-foreground/85">
                {c.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function LockedArticleNotice({
  onSubscribeClick,
}: {
  onSubscribeClick: () => void;
}) {
  return (
    <Card className="mt-2 flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-base font-bold text-navy">
        هذا المقال متاح للمشتركين فقط
      </p>
      <p className="text-sm text-muted-foreground">
        اشترك الآن للوصول الكامل لهذا المقال وجميع المقالات الأخرى
      </p>
      <Button variant="gold" onClick={onSubscribeClick} className="mt-2">
        اشترك الآن
      </Button>
    </Card>
  );
}

export function ArticleView({ articleId }: { articleId: string }) {
  const { navigate, articleMap, articles } = useMadar();
  const { sdk, restoredPurchases } = usePiAuth();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const article = articleMap[articleId];

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">المقال غير موجود</p>
        <Button variant="gold" className="mt-4" onClick={() => navigate("home")}>
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  const featured = articles[0];
  const isPiUser = sdk !== null;
  const isSubscribed =
    restoredPurchases?.some(
      (p) => p.productId === SUBSCRIPTION_PRODUCT_ID && p.quantity > 0,
    ) ?? false;
  const isLocked =
    isPiUser &&
    restoredPurchases !== null &&
    !isSubscribed &&
    article.id !== featured?.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <button
        onClick={() => navigate("archive")}
        className="mb-4 flex items-center gap-1 text-sm font-bold text-gold-deep hover:underline"
      >
        <IconChevronRight size={16} />
        العودة إلى الأرشيف
      </button>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Pill>{article.category}</Pill>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconClock size={13} />
          {formatDate(article.publishedAt)}
        </span>
      </div>
      <h1 className="mb-4 text-2xl font-bold leading-snug text-navy text-balance">
        {article.title}
      </h1>

      {isLocked ? (
        <LockedArticleNotice onSubscribeClick={() => setSubscribeOpen(true)} />
      ) : (
        <>
          <div className="mt-2 overflow-hidden">
            <div className="mb-4 w-full overflow-hidden rounded-lg sm:float-left sm:mb-2 sm:ml-0 sm:mr-6 sm:w-1/2">
              {article.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-auto w-full object-contain"
                />
              ) : (
                <ThumbArt
                  hue={article.thumbHue}
                  className="w-full"
                  style={{ aspectRatio: `${article.sideImageWidth} / ${article.sideImageHeight}` }}
                />
              )}
            </div>

            <article className="md-article-body space-y-4 text-justify text-[15px] leading-loose text-foreground/90">
              {article.body.map((p, i) => (
                <ReactMarkdown key={i}>{p}</ReactMarkdown>
              ))}
            </article>
          </div>

          {article.videoUrl && <ArticleVideo videoUrl={article.videoUrl} />}

          {article.references && article.references.length > 0 && (
            <ReferencesTable references={article.references} />
          )}

          <AuthorBlock article={article} />
          <LikeBar articleId={articleId} article={article} />
          <CommentSection articleId={articleId} />
        </>
      )}

      <PaymentPrompt
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />
    </div>
  );
}
