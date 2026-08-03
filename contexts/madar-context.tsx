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
  DEFAULT_LIKES,
  DEFAULT_COMMENTS,
  sanitizeProfile,
  sanitizeLikes,
  sanitizeComments,
  profileToBlob,
  likesToBlob,
  commentsToBlob,
} from "@/lib/madar/data";
import { fetchArticlesFromSupabase } from "@/lib/madar/supabase-articles";

const memStore = new Map<string, Record<string, unknown>>();

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

  const [route, setRoute] = useState<RouteName>("home");
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [likes, setLikes] = useState<LikesState>(DEFAULT_LIKES);
  const [comments, setComments] = useState<CommentsState>(DEFAULT_COMMENTS);

  const [articles, setArticles] = useState<Article[]>([]);
  const [articleMap, setArticleMap] = useState<Record<string, Article>>({});

  const profileRef = useRef<ProfileState>(DEFAULT_PROFILE);
  const likesRef = useRef<LikesState>(DEFAULT_LIKES);
  const commentsRef = useRef<CommentsState>(DEFAULT_COMMENTS);
  const articlesRef = useRef<Article[]>([]);

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
  const backoff = useRef<Record<string, number>>({});
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
      const [rp, rl, rc, fetchedArticles] = await Promise.all([
        readKey(KEYS.profile),
        readKey(KEYS.likes),
        readKey(KEYS.comments),
        fetchArticlesFromSupabase(),
      ]);
      if (cancelled) return;
      const p = sanitizeProfile(rp);
      const l = sanitizeLikes(rl);
      const c = sanitizeComments(rc);
      profileRef.current = p;
      likesRef.current = l;
      commentsRef.current = c;
      articlesRef.current = fetchedArticles;
      setProfile(p);
      setLikes(l);
      setComments(c);
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

  const navigate = useCallback((r: RouteName, articleId?: string) => {
    setRoute(r);
    setCurrentArticleId(articleId ?? null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
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
    (articleId: string) => likes.liked.includes(articleId),
    [likes],
  );

  const likeCount = useCallback(
    (articleId: string) => {
      const base = articlesRef.current.find((a) => a.id === articleId)?.baseLikes ?? 0;
      return base + (likes.liked.includes(articleId) ? 1 : 0);
    },
    [likes],
  );

  const toggleLike = useCallback(
    (articleId: string) => {
      const has = likesRef.current.liked.includes(articleId);
      const liked = has
        ? likesRef.current.liked.filter((x) => x !== articleId)
        : [...likesRef.current.liked, articleId];
      const next: LikesState = { liked };
      likesRef.current = next;
      setLikes(next);
      scheduleSave(KEYS.likes, likesToBlob(next));
    },
    [scheduleSave],
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
      const comment: Comment = {
        id: uid(),
        articleId,
        name: name.trim().slice(0, 40) || "زائر",
        text: cleanText,
        createdAt: Date.now(),
      };
      const next: CommentsState = {
        items: [...commentsRef.current.items, comment],
      };
      commentsRef.current = next;
      setComments(next);
      scheduleSave(KEYS.comments, commentsToBlob(next));
      pushToast("تم نشر تعليقك");
    },
    [scheduleSave, pushToast],
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
