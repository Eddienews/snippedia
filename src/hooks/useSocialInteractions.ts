import { useState, useEffect } from "react";

export interface SocialInteractions {
  likes: number;
  shares: number;
  views: number;
  liked: boolean;
}

const STORAGE_PREFIX = "snippedia-social-";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const useSocialInteractions = (articleId?: number | string) => {
  const [social, setSocial] = useState<SocialInteractions>({
    likes: 0,
    shares: 0,
    views: 0,
    liked: false,
  });

  useEffect(() => {
    if (!articleId) return;

    const raw = localStorage.getItem(`${STORAGE_PREFIX}${articleId}`);
    setSocial(
      safeParse<SocialInteractions>(raw, {
        likes: 0,
        shares: 0,
        views: 0,
        liked: false,
      })
    );
  }, [articleId]);

  const persist = (next: SocialInteractions) => {
    if (!articleId) return;
    localStorage.setItem(`${STORAGE_PREFIX}${articleId}`, JSON.stringify(next));
  };

  const like = () => {
    setSocial((prev) => {
      const next = {
        ...prev,
        likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
        liked: !prev.liked,
      };
      persist(next);
      return next;
    });
  };

  const share = () => {
    setSocial((prev) => {
      const next = { ...prev, shares: prev.shares + 1 };
      persist(next);
      return next;
    });
  };

  const view = () => {
    setSocial((prev) => {
      const next = { ...prev, views: prev.views + 1 };
      persist(next);
      return next;
    });
  };

  return {
    social,
    like,
    share,
    view,
  };
};
