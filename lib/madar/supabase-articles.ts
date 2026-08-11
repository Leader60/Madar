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
  references: string | null;
};

// يحوّل نص "العنوان | الرابط" (سطر لكل مرجع) إلى مصفوفة ArticleReference.
// أسطر فارغة أو ناقصة الفاصل | تُتجاهل بصمت.
function parseReferences(raw: string | null): ArticleReference[] | undefined {
  if (!raw || !raw.trim()) return undefined;
  const refs = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      const title = parts[0]?.trim() ?? "";
      const url = parts[1]?.trim() ?? "";
      return { title, url };
    })
    .filter((r) => r.title && r.url);
  return refs.length > 0 ? refs : undefined;
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
    references: parseReferences(row.references),
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
