/**
 * Single TTL for home page + Card Highlight (best seller + image bytes) so data stays in sync.
 * Cron or external schedulers can call `/api/cron/revalidate-home` on this cadence to warm cache.
 */
export const HYPEMETER_DATA_REVALIDATE_SEC = 5 * 60 * 60;

/** How long the home data pipeline can be served from Next.js Data Cache (seconds). */
export const HOME_PAGE_DATA_CACHE_TTL_SEC = HYPEMETER_DATA_REVALIDATE_SEC;

/** Card Highlight Jina parse + proxy image bytes — same TTL as home. */
export const CARD_TRADER_HIGHLIGHT_CACHE_SEC = HYPEMETER_DATA_REVALIDATE_SEC;

/** `unstable_cache` + `revalidateTag` — invalidate together from cron. */
export const HYPEMETER_CACHE_TAG_HOME = "hypemeter-home";

/**
 * Budget for `resolvePokemonOfDayBundleCached` (RSS + catalog + PokeAPI). Sub-second
 * timeouts almost always lose the race on cold serverless, leaving the highlight empty
 * until a later refresh; 12s matches other cold home fetches.
 */
export const HOME_POKEMON_RESOLVE_BUDGET_MS = 12_000;
