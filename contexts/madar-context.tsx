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
import { usePiAuth } from "@/contexts/pi-auth-context";
import {
  KEYS,
  ARTICLE_MAP,
  uid,
  type RouteName,
  type Comment,
  type Toast,
  type ProfileState,
  type LikesState,
  type CommentsState,
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

// In-App-Studio the SDK instance is null; fall back to an in-memory store so the
// app stays fully functional during preview. Real Pi sessions persist to user-state.
const memStore = new Map<string, Record<string, unknown>>();

interface MadarContextValue {
  ready: boolean;
  storageNotice: boolean;
  toasts: Toast[];
  pushToast: (message: string) => void;
  // routing
  route: RouteName;
  currentArticleId: string | null;
  navigate: (route: RouteName, articleId?: string) => void;
  // profile
  profile: ProfileState;
  saveDisplayName: (name: string) => void;
  // likes
  isLiked: (articleId: string) => boolean;
  likeCount: (articleId: string) => number;
  toggleLike: (articleId: string) => void;
  // comments
  commentsFor: (articleId: string) => Comment[];
  addComment: (articleId: string, name: string, text: string) => void;
}

const MadarContext = createContext<MadarContextValue | undefined>(undefined);

export function MadarProvider({ children }: { children: ReactNode }) {
  const { sdk, isAuthenticated } = usePiAuth();

  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [route, setRoute] = useState<RouteName>("home");
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileState>(DEFAULT_PROFILE);
  const [likes, setLikes] = useState<LikesState>(DEFAULT_LIKES);
  const [comments, setComments] = useState<CommentsState>(DEFAULT_COMMENTS);

  // authoritative refs used for saves
  const profileRef = useRef<ProfileState>(DEFAULT_PROFILE);
  const likesRef = useRef<LikesState>(DEFAULT_LIKES);
  const commentsRef = useRef<CommentsState>(DEFAULT_COMMENTS);

  const toastId = useRef(0);
  const pushToast = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2800);
  }, []);

  // ---- low level storage helpers ----
  const readKey = useCallback(
    async (key: string): Promise<Record<string, unknown> | null> => {
      if (sdk?.state) {
        try {
          const rec = await sdk.state.get(key);
          return rec ? rec.blob : null;
        } catch {
          return memStore.get(key) ?? null;
        }
      }
      return memStore.get(key) ?? null;
    },
    [sdk],
  );

  // per-key debounced saving with backoff
  const timers = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const backoff = useRef<Record<string, number>>({});
  const pending = useRef<Record<string, Record<string, unknown>>>({});

  const writeNow = useCallback(
    async (key: string, blob: Record<string, unknown>) => {
      if (sdk?.state) {
        try {
          await sdk.state.set(key, blob);
          backoff.current[key] = 0;
          if (storageNotice) setStorageNotice(false);
        } catch {
          memStore.set(key, blob);
          const next = Math.min((backoff.current[key] || 1600) * 1.8, 30000);
          backoff.current[key] = next;
          setStorageNotice(true);
          timers.current[key] = setTimeout(() => {
            void writeNow(key, pending.current[key] ?? blob);
          }, next);
        }
      } else {
        memStore.set(key, blob);
      }
    },
    [sdk, storageNotice],
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

  // ---- initial load ----
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const [rp, rl, rc] = await Promise.all([
        readKey(KEYS.profile),
        readKey(KEYS.likes),
        readKey(KEYS.comments),
      ]);
      if (cancelled) return;
      const p = sanitizeProfile(rp);
      const l = sanitizeLikes(rl);
      const c = sanitizeComments(rc);
      profileRef.current = p;
      likesRef.current = l;
      commentsRef.current = c;
      setProfile(p);
      setLikes(l);
      setComments(c);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // flush on hide
  useEffect(() => {
    const handler = () => flushAll();
    window.addEventListener("pagehide", handler);
    document.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("pagehide", handler);
      document.removeEventListener("visibilitychange", handler);
    };
  }, [flushAll]);

  // ---- routing ----
  const navigate = useCallback((r: RouteName, articleId?: string) => {
    setRoute(r);
    setCurrentArticleId(articleId ?? null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  // ---- profile ----
  const saveDisplayName = useCallback(
    (name: string) => {
      const next: ProfileState = { displayName: name.slice(0, 40) };
      profileRef.current = next;
      setProfile(next);
      scheduleSave(KEYS.profile, profileToBlob(next));
    },
    [scheduleSave],
  );

  // ---- likes ----
  const isLiked = useCallback(
    (articleId: string) => likes.liked.includes(articleId),
    [likes],
  );

  const likeCount = useCallback(
    (articleId: string) => {
      const base = ARTICLE_MAP[articleId]?.baseLikes ?? 0;
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

  // ---- comments ----
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
  };

  return <MadarContext.Provider value={value}>{children}</MadarContext.Provider>;
}

export function useMadar() {
  const ctx = useContext(MadarContext);
  if (!ctx) throw new Error("useMadar must be used within MadarProvider");
  return ctx;
}
