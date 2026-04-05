"use client";

import { useEffect } from "react";
import { HOME_PAGE_DATA_CACHE_TTL_SEC } from "@/lib/homePageCacheConfig";
import { homeRefreshPeriodEndMs } from "@/lib/homeRefreshPeriodAnchor";

const STORAGE_KEY = "hypemeter-home-browser-buffer-v1";

export type HomeBrowserBufferPayload = {
  score: number;
  updatedAt: string;
  /** Unix ms when the server finished computing this snapshot (stable while server cache hits). */
  computedAt: number;
  pokemonImageUrl?: string | null;
};

/**
 * Persists the last successful home snapshot in localStorage so devtools / future features
 * can inspect freshness. Server-side `unstable_cache` is what avoids refetching upstreams
 * on every reload; this buffer is metadata + a light client mirror.
 */
export function HomePageClientCacheWriter({ payload }: { payload: HomeBrowserBufferPayload }) {
  useEffect(() => {
    try {
      const record = {
        ...payload,
        savedAtClient: Date.now(),
        serverCacheTtlSec: HOME_PAGE_DATA_CACHE_TTL_SEC,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));

      // Cookie mirror — align expiry to the same wall-clock period as the countdown.
      const expires = new Date(homeRefreshPeriodEndMs(Date.now(), HOME_PAGE_DATA_CACHE_TTL_SEC)).toUTCString();
      document.cookie = `hypemeter_home_meta=${encodeURIComponent(
        JSON.stringify({ score: payload.score, updatedAt: payload.updatedAt, computedAt: payload.computedAt }),
      )}; path=/; expires=${expires}; SameSite=Lax`;
      if (payload.pokemonImageUrl) {
        document.cookie = `hypemeter_pokemon_image=${encodeURIComponent(payload.pokemonImageUrl)}; path=/; expires=${expires}; SameSite=Lax`;
      }
    } catch {
      /* quota / private mode */
    }
  }, [payload]);

  return null;
}
