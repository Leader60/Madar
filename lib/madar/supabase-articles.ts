import { createClient } from "@supabase/supabase-js";
import type { Article, ArticleReference } from "./data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type ArticleRow = {
  id: number;
  title: string;
  summary: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  category: string;
  is_featured: boolean;
  slug: string;
  published_at: string;
  author_name: string | null;
  author_bio: string | null;
  author_image: string | null;
  references: ArticleReference[] | null;
};

function sanitizeReferences(raw: unknown): ArticleReference[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const cleaned = raw
    .filter(
      (r): r is { title?: unknown; url?: unknown } =>
        typeof r === "object" && r !== null,
    )
    .map((r) => ({
      title: typeof r.title === "string" ? r.title.trim() : "",
      url: typeof r.url === "string" ? r.url.trim() : "",
    }))
    .filter((r) => r.title && r.url);
  return cleaned.length > 0 ? cleaned : undefined;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.slug,
    title: row.title,
    excerpt: row.summary,
    category: row.category,
    publishedAt: row.published_at,
    thumbHue: 200,
    sideImageWidth: 320,
    sideImageHeight: 200,
    imageUrl: row.image_url || undefined,
    videoUrl: row.video_url || undefined,
    references: sanitizeReferences(row.references),
    body: row.content.split(/\n\s*\n/).filter(Boolean),
    author: {
      name: row.author_name || "فريق مدار",
      bio: row.author_bio || "",
      imageUrl: row.author_image || undefined,
    },
    baseLikes: 0,
    isFeatured: !!row.is_featured,
  };
}

export async function fetchArticlesFromSupabase(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });
  if (error || !data) {
    console.error("Error fetching articles:", error);
    return [];
  }
  return data.map(rowToArticle);
}
