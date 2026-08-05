"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  KEYS,
  uid,
  type RouteName,
  type Comment,
  type Toast,
  type ProfileState,
  type LikesState,
  type CommentsState,
  type Article,
  DEFAULT_PROFILE,
  sanitizeProfile,
  profileToBlob,
} from "@/lib/madar/data";
import { fetchArticlesFromSupabase } from "@/lib/madar/supabase-articles";
import {
  fetchLikedArticleIds,
  fetchLikeCounts,
  addLike,
  removeLike,
  fetchComments,
  addCommentToSupabase,
} from "@/lib/madar/interactions";

const memStore = new Map<string, Record<string, unknown>>();

function parseArticleIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/article\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

interface MadarContextValue {
  ready: boolean;
  storageNotice: boolean;
  toasts: Toast[];
  pushToast: (message: string) => void;
  route: RouteName;
  currentArticleId: string | null;
  navigate: (route: RouteName, articleId?: string) => void;
  profile: ProfileState;
  saveDisplayName: (name: string) => void;
  isLiked: (articleId: string) => boolean;
  likeCount: (articleId: string) => number;
  toggleLike: (articleId: string) => void;
  commentsFor: (articleId: string) => Comment[];
  addComment: (articleId: string, name: string, text: string) => void;
  articles: Article[];
  articleMap: Record<string, Article>;
}

const MadarContext = createContext<MadarContextValue | undefined>(undefined);

export function MadarProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [route, setRoute] = useState<RouteName>(() => {
    if (typeof window === "undefined") return "home";
    return parseArticleIdFromPath(window.location.pathname) ? "article" : "home";
  });
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return parseArticleIdFromPath(window.location.pathname);
  });

  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<CommentsState>({ items: [] });

  const [articles, setArticles] = useState<Article[]>([]);
  const [articleMap, setArticleMap] = useState<Record<string, Article>>({});

  const profileRef = useRef<ProfileState>(DEFAULT_PROFILE);
  const likedIdsRef = useRef<string[]>([]);

  const toastId = useRef(0);
  const pushToast = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  }, []);

  const readKey = useCallback(
    async (key: string): Promise<Record<string, unknown> | null> => {
      return memStore.get(key) ?? null;
    },
    [],
  );

  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const pending = useRef<Record<string, Record<string, unknown>>>({});

  const writeNow = useCallback(
    async (key: string, blob: Record<string, unknown>) => {
      memStore.set(key, blob);
    },
    [],
  );

  const scheduleSave = useCallback(
    (key: string, blob: Record<string, unknown>) => {
      pending.current[key] = blob;
      if (timers.current[key]) clearTimeout(timers.current[key]!);
      timers.current[key] = setTimeout(() => {
        void writeNow(key, blob);
      }, 1300);
    },
    [writeNow],
  );

  const flushAll = useCallback(() => {
    for (const [key, timer] of Object.entries(timers.current)) {
      if (timer) {
        clearTimeout(timer);
        const blob = pending.current[key];
        if (blob) void writeNow(key, blob);
      }
    }
  }, [writeNow]);

  // تحميل الصحيفة يبدأ فوراً بمجرد فتح التطبيق — بدون انتظار Pi Auth
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [rp, fetchedArticles, liked, counts, allComments] = await Promise.all([
        readKey(KEYS.profile),
        fetchArticlesFromSupabase(),
        fetchLikedArticleIds(),
        fetchLikeCounts(),
        fetchComments(),
      ]);
      if (cancelled) return;

      const p = sanitizeProfile(rp);
      profileRef.current = p;
      likedIdsRef.current = liked;

      setProfile(p);
      setLikedIds(liked);
      setLikeCounts(counts);
      setComments({
        items: allComments.map((c) => ({
          id: String(c.id),
          articleId: c.article_id,
          name: c.name,
          text: c.text,
          createdAt: new Date(c.created_at).getTime(),
        })),
      });
      setArticles(fetchedArticles);
      setArticleMap(
        fetchedArticles.reduce(
          (acc, a) => {
            acc[a.id] = a;
            return acc;
          },
          {} as Record<string, Article>,
        ),
      );
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [readKey]);

  useEffect(() => {
    const handler = () => flushAll();
    window.addEventListener("pagehide", handler);
    document.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("pagehide", handler);
      document.removeEventListener("visibilitychange", handler);
    };
  }, [flushAll]);

  // مزامنة الحالة مع أزرار "رجوع/تقدم" في المتصفح
  useEffect(() => {
    const onPopState = () => {
      const id = parseArticleIdFromPath(window.location.pathname);
      if (id) {
        setRoute("article");
        setCurrentArticleId(id);
      } else {
        setRoute("home");
        setCurrentArticleId(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((r: RouteName, articleId?: string) => {
    setRoute(r);
    setCurrentArticleId(articleId ?? null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
      const path =
        r === "article" && articleId
          ? `/article/${encodeURIComponent(articleId)}`
          : "/";
      if (window.location.pathname !== path) {
        window.history.pushState(null, "", path);
      }
    }
  }, []);

  const saveDisplayName = useCallback(
    (name: string) => {
      const next: ProfileState = { displayName: name.slice(0, 40) };
      profileRef.current = next;
      setProfile(next);
      scheduleSave(KEYS.profile, profileToBlob(next));
    },
    [scheduleSave],
  );

  const isLiked = useCallback(
    (articleId: string) => likedIds.includes(articleId),
    [likedIds],
  );

  const likeCount = useCallback(
    (articleId: string) => {
      const base = articles.find((a) => a.id === articleId)?.baseLikes ?? 0;
      return base + (likeCounts[articleId] ?? 0);
    },
    [articles, likeCounts],
  );

  const toggleLike = useCallback(
    (articleId: string) => {
      const has = likedIdsRef.current.includes(articleId);

      const nextLiked = has
        ? likedIdsRef.current.filter((x) => x !== articleId)
        : [...likedIdsRef.current, articleId];
      likedIdsRef.current = nextLiked;
      setLikedIds(nextLiked);
      setLikeCounts((prev) => ({
        ...prev,
        [articleId]: Math.max(0, (prev[articleId] ?? 0) + (has ? -1 : 1)),
      }));

      if (has) {
        void removeLike(articleId);
      } else {
        void addLike(articleId);
      }
    },
    [],
  );

  const commentsFor = useCallback(
    (articleId: string) =>
      comments.items
        .filter((c) => c.articleId === articleId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [comments],
  );

  const addComment = useCallback(
    (articleId: string, name: string, text: string) => {
      const cleanText = text.trim().slice(0, 500);
      if (!cleanText) return;
      const cleanName = name.trim().slice(0, 40) || "زائر";

      const tempComment: Comment = {
        id: uid(),
        articleId,
        name: cleanName,
        text: cleanText,
        createdAt: Date.now(),
      };
      setComments((prev) => ({ items: [...prev.items, tempComment] }));
      pushToast("تم نشر تعليقك");

      void addCommentToSupabase(articleId, cleanName, cleanText);
    },
    [pushToast],
  );

  const value: MadarContextValue = {
    ready,
    storageNotice,
    toasts,
    pushToast,
    route,
    currentArticleId,
    navigate,
    profile,
    saveDisplayName,
    isLiked,
    likeCount,
    toggleLike,
    commentsFor,
    addComment,
    articles,
    articleMap,
  };

  return <MadarContext.Provider value={value}>{children}</MadarContext.Provider>;
}

export function useMadar() {
  const ctx = useContext(MadarContext);
  if (!ctx) throw new Error("useMadar must be used within MadarProvider");
  return ctx;
}
