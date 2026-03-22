import type { MarketSnapshot } from "@/lib/marketSnapshot";

/**
 * Optional static numbers for **local demos only**. Never used on Vercel production — baked-in
 * prices were mistaken for “live” Yahoo data when APIs failed.
 *
 * - **Production** (`VERCEL_ENV=production` or `NODE_ENV=production`): static fill is **disabled**
 *   regardless of env vars (prevents accidental `MARKET_SNAPSHOT_STATIC_FALLBACK=1` on Vercel).
 * - **Local dev**: `MARKET_SNAPSHOT_STATIC_FALLBACK=1` — fill nulls from {@link MARKET_SNAPSHOT_PAGE_FALLBACK}.
 * - `DISABLE_MARKET_SNAPSHOT_FALLBACK=1` — skip static fill in dev too.
 */
export const MARKET_SNAPSHOT_PAGE_FALLBACK: MarketSnapshot = {
  sp500: 6506.48,
  bitcoin: 70076.5,
  nintendo: 14.7,
  nintendoPreviousClose: 15.2,
  sp500GrowthPct: -1.34,
  /** Slightly positive so the BTC card isn’t the same “red” as S&P when fallback fills all fields. */
  bitcoinGrowthPct: 0.12,
  nintendoGrowthPct: -3.29,
  updatedAt: null,
};

function stampNow(): string {
  return new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Any Vercel deploy or production Node — demo constants must never mask failed Yahoo fetches. */
function isProductionContext(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production"
  );
}

/**
 * Fills any null numeric fields from {@link MARKET_SNAPSHOT_PAGE_FALLBACK} (non-production only).
 * Preserves live values when present. Sets `updatedAt` if it was null.
 */
export function applyMarketSnapshotFallback(snapshot: MarketSnapshot): MarketSnapshot {
  if (process.env.DISABLE_MARKET_SNAPSHOT_FALLBACK === "1") {
    return snapshot;
  }
  if (isProductionContext()) {
    return snapshot;
  }
  if (process.env.MARKET_SNAPSHOT_STATIC_FALLBACK !== "1") {
    return snapshot;
  }
  const f = MARKET_SNAPSHOT_PAGE_FALLBACK;
  return {
    sp500: snapshot.sp500 ?? f.sp500,
    bitcoin: snapshot.bitcoin ?? f.bitcoin,
    nintendo: snapshot.nintendo ?? f.nintendo,
    nintendoPreviousClose: snapshot.nintendoPreviousClose ?? f.nintendoPreviousClose,
    sp500GrowthPct: snapshot.sp500GrowthPct ?? f.sp500GrowthPct,
    bitcoinGrowthPct: snapshot.bitcoinGrowthPct ?? f.bitcoinGrowthPct,
    nintendoGrowthPct: snapshot.nintendoGrowthPct ?? f.nintendoGrowthPct,
    updatedAt: snapshot.updatedAt ?? stampNow(),
  };
}
