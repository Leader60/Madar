import { createClient } from "@supabase/supabase-js";
import type { Article } from "./data";

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
  category: string;
  is_featured: boolean;
  slug: string;
  published_at: string;
  author_name: string | null;
  author_bio: string | null;
  author_image: string | null;
};

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
    body: row.content.split(/\n\s*\n/).filter(Boolean),
    author: {
      name: row.author_name || "فريق مدار",
      bio: row.author_bio || "",
      imageUrl: row.author_image || undefined,
    },
    baseLikes: 0,
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
