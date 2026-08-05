import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const DEVICE_ID_KEY = "madar_device_id";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ---- Likes ----

export async function fetchLikedArticleIds(): Promise<string[]> {
  const deviceId = getDeviceId();
  if (!deviceId) return [];
  const { data, error } = await supabase
    .from("likes")
    .select("article_id")
    .eq("device_id", deviceId);
  if (error || !data) {
    console.error("Error fetching likes:", error);
    return [];
  }
  return data.map((row) => row.article_id as string);
}

export async function fetchLikeCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("likes").select("article_id");
  if (error || !data) {
    console.error("Error fetching like counts:", error);
    return {};
  }
  const counts: Record<string, number> = {};
  for (const row of data) {
    const id = row.article_id as string;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return counts;
}

export async function addLike(articleId: string): Promise<boolean> {
  const deviceId = getDeviceId();
  if (!deviceId) return false;
  const { error } = await supabase
    .from("likes")
    .insert({ article_id: articleId, device_id: deviceId });
  if (error) {
    console.error("Error adding like:", error);
    return false;
  }
  return true;
}

export async function removeLike(articleId: string): Promise<boolean> {
  const deviceId = getDeviceId();
  if (!deviceId) return false;
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("article_id", articleId)
    .eq("device_id", deviceId);
  if (error) {
    console.error("Error removing like:", error);
    return false;
  }
  return true;
}

// ---- Comments ----

export interface CommentRow {
  id: number;
  article_id: string;
  name: string;
  text: string;
  created_at: string;
}

export async function fetchComments(): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) {
    console.error("Error fetching comments:", error);
    return [];
  }
  return data as CommentRow[];
}

export async function addCommentToSupabase(
  articleId: string,
  name: string,
  text: string,
): Promise<CommentRow | null> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ article_id: articleId, name, text })
    .select()
    .single();
  if (error || !data) {
    console.error("Error adding comment:", error);
    return null;
  }
  return data as CommentRow;
}
