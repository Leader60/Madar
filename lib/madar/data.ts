// Madar — Arabic crypto & digital economy news platform
// Data types and persistence helpers.
// Article content now comes exclusively from Supabase (see lib/madar/supabase-articles.ts).

export type RouteName =
  | "home"
  | "archive"
  | "article"
  | "about"
  | "contact"
  | "privacy"
  | "terms";

export interface AuthorInfo {
  name: string;
  bio: string;
  imageUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string; // ISO date
  thumbHue: number; // for generated art
  sideImageWidth: number; // px, configurable per article
  sideImageHeight: number; // px, configurable per article
  imageUrl?: string; // real photo, takes priority over generated art
  body: string[]; // paragraphs
  author: AuthorInfo;
  baseLikes: number;
  isFeatured?: boolean; // manually controls whether this article shows as the main/featured article
}

export interface Comment {
  id: string;
  articleId: string;
  name: string;
  text: string;
  createdAt: number;
}

export interface Toast {
  id: number;
  message: string;
}

// ---- persistence keys ----
export const KEYS = {
  profile: "madar.profile",
  likes: "madar.likes",
  comments: "madar.comments",
} as const;

export const COMMENTS_CAP = 120;
export const LIKED_CAP = 200;

// Articles now come from Supabase at runtime, not this static file — see
// MadarProvider (contexts/madar-context.tsx), which loads them via
// fetchArticlesFromSupabase() and keeps them in React state.
// ARTICLE_IDS_SET therefore takes the current article list as a parameter
// instead of reading from a static array.
export function articleIdsSet(articles: Article[]): Set<string> {
  return new Set(articles.map((a) => a.id));
}

// ---- helpers ----
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function cleanStr(v: unknown, max = 600): string {
  if (typeof v !== "string") return "";
  // strip control chars and angle brackets to keep loaded state safe as text
  return v
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .slice(0, max)
    .trim();
}

const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export function toArabicNum(input: number | string): string {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(input).replace(/[0-9]/g, (d) => map[Number(d)]);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${toArabicNum(d.getDate())} ${AR_MONTHS[d.getMonth()]} ${toArabicNum(
    d.getFullYear(),
  )}`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "الآن";
  if (min < 60) return `منذ ${toArabicNum(min)} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `منذ ${toArabicNum(hr)} ساعة`;
  const day = Math.floor(hr / 24);
  return `منذ ${toArabicNum(day)} يوم`;
}

// ---- news ticker headlines (global Arabic economic feed) ----
export const TICKER_HEADLINES: string[] = [
  "بيتكوين يتجاوز حاجزًا سعريًا جديدًا مع تدفق السيولة المؤسسية",
  "شبكة باي تعلن عن تطورات في منظومتها التطبيقية العالمية",
  "الاقتصاد الرقمي يسجل نموًا متسارعًا في أسواق الشرق الأوسط",
  "إيثريوم يشهد ارتفاعًا في نشاط العقود الذكية هذا الأسبوع",
  "البنوك المركزية تدرس إطلاق عملات رقمية سيادية جديدة",
  "ارتفاع حجم التداول اليومي في أسواق العملات المشفرة",
  "تقارير: تبني المؤسسات للأصول الرقمية يواصل الصعود",
  "مطورو شبكة باي يوسّعون قاعدة التطبيقات اللامركزية",
];

// footer ticker links
export const FOOTER_LINKS: { label: string; route: RouteName }[] = [
  { label: "شروط الاستخدام", route: "terms" },
  { label: "سياسات الخصوصية", route: "privacy" },
];

// ---- state shapes ----
export interface ProfileState {
  displayName: string;
}

export interface LikesState {
  // articleId -> extra like count contributed by this user (0 or 1)
  liked: string[];
}

export interface CommentsState {
  items: Comment[];
}

export const DEFAULT_PROFILE: ProfileState = { displayName: "" };
export const DEFAULT_LIKES: LikesState = { liked: [] };
export const DEFAULT_COMMENTS: CommentsState = { items: [] };

// ---- sanitizers (loaded state is untrusted) ----
// These now take the current article list (from Supabase, held in context
// state) so they can validate articleIds against what's actually live.
export function sanitizeProfile(blob: unknown): ProfileState {
  const b = (blob ?? {}) as Record<string, unknown>;
  return { displayName: cleanStr(b.displayName, 40) };
}

export function sanitizeLikes(blob: unknown, articles: Article[]): LikesState {
  const b = (blob ?? {}) as Record<string, unknown>;
  const set = articleIdsSet(articles);
  const arr = Array.isArray(b.liked) ? b.liked : [];
  const liked = arr
    .filter((x): x is string => typeof x === "string" && set.has(x))
    .slice(0, LIKED_CAP);
  return { liked: Array.from(new Set(liked)) };
}

export function sanitizeComments(blob: unknown, articles: Article[]): CommentsState {
  const b = (blob ?? {}) as Record<string, unknown>;
  const set = articleIdsSet(articles);
  const arr = Array.isArray(b.items) ? b.items : [];
  const items: Comment[] = [];
  for (const raw of arr) {
    if (typeof raw !== "object" || raw === null) continue;
    const r = raw as Record<string, unknown>;
    const articleId = cleanStr(r.articleId, 64);
    if (!set.has(articleId)) continue;
    const text = cleanStr(r.text, 500);
    if (!text) continue;
    items.push({
      id: cleanStr(r.id, 40) || uid(),
      articleId,
      name: cleanStr(r.name, 40) || "زائر",
      text,
      createdAt: clampNum(r.createdAt, 0, Date.now() + 60000, Date.now()),
    });
    if (items.length >= COMMENTS_CAP) break;
  }
  return { items };
}

export function likesToBlob(s: LikesState): Record<string, unknown> {
  return { liked: s.liked.slice(0, LIKED_CAP) };
}

export function commentsToBlob(s: CommentsState): Record<string, unknown> {
  return {
    items: s.items.slice(-COMMENTS_CAP).map((c) => ({
      id: c.id,
      articleId: c.articleId,
      name: c.name,
      text: c.text,
      createdAt: c.createdAt,
    })),
  };
}

export function profileToBlob(s: ProfileState): Record<string, unknown> {
  return { displayName: s.displayName };
}
