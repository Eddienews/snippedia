import { useEffect, useMemo, useState } from "react";

export type ReactionType = "like" | "love" | "wow" | "sad" | "angry";

type ReactionsState = Record<ReactionType, { count: number; userReacted: boolean }>;

export interface SocialData {
  reactions: ReactionsState;
}

const STORAGE_PREFIX = "snippedia-reactions-";

const DEFAULT_REACTIONS: ReactionsState = {
  like: { count: 0, userReacted: false },
  love: { count: 0, userReacted: false },
  wow: { count: 0, userReacted: false },
  sad: { count: 0, userReacted: false },
  angry: { count: 0, userReacted: false },
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function useReactions(articleId?: string | number) {
  const storageKey = useMemo(
    () => (articleId ? `${STORAGE_PREFIX}${articleId}` : null),
    [articleId]
  );

  const [socialData, setSocialData] = useState<SocialData>({
    reactions: DEFAULT_REACTIONS,
  });

  useEffect(() => {
    if (!storageKey) return;

    const raw = localStorage.getItem(storageKey);
    const next = safeParse<SocialData>(raw, { reactions: DEFAULT_REACTIONS });

    setSocialData({
      reactions: {
        ...DEFAULT_REACTIONS,
        ...(next?.reactions ?? {}),
      },
    });
  }, [storageKey]);

  const persist = (next: SocialData) => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const toggleReaction = (type: ReactionType) => {
    setSocialData((prev) => {
      const current = prev.reactions[type] ?? { count: 0, userReacted: false };
      const nextEntry = {
        count: current.userReacted ? Math.max(0, current.count - 1) : current.count + 1,
        userReacted: !current.userReacted,
      };

      const next: SocialData = {
        reactions: {
          ...prev.reactions,
          [type]: nextEntry,
        },
      };

      persist(next);
      return next;
    });
  };

  const getReactionEmoji = (type: ReactionType) => {
    switch (type) {
      case "like":
        return "👍";
      case "love":
        return "❤️";
      case "wow":
        return "😮";
      case "sad":
        return "😢";
      case "angry":
        return "😡";
      default:
        return "👍";
    }
  };

  const getTotalReactions = () => {
    const r = socialData.reactions;
    return (Object.keys(r) as ReactionType[]).reduce(
      (sum, k) => sum + (r[k]?.count ?? 0),
      0
    );
  };

  const getUserReaction = () => {
    const r = socialData.reactions;
    const found = (Object.keys(r) as ReactionType[]).find((k) => r[k]?.userReacted);
    return found ?? null;
  };

  return {
    socialData,
    toggleReaction,
    getReactionEmoji,
    getTotalReactions,
    getUserReaction,
  };
}
