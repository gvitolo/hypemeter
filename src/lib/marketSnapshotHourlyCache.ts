import { unstable_cache } from "next/cache";
import { fetchMarketSnapshot } from "@/lib/fetchMarketSnapshot";
import { HYPEMETER_DATA_REVALIDATE_SEC } from "@/lib/homePageCacheConfig";

/** Backend cadence aligns with home snapshot refresh (every 5 hours). */
export const MARKET_SIDECAR_REVALIDATE_SEC = HYPEMETER_DATA_REVALIDATE_SEC;

/** Invalidate with `revalidateTag` from Reload/cron to warm quotes without waiting for TTL. */
export const HYPEMETER_CACHE_TAG_MARKET_SIDECAR = "hypemeter-market-sidecar";

export const fetchMarketSnapshotHourly = unstable_cache(
  async () => fetchMarketSnapshot(),
  ["market-snapshot-hourly-v1"],
  { revalidate: MARKET_SIDECAR_REVALIDATE_SEC, tags: [HYPEMETER_CACHE_TAG_MARKET_SIDECAR] },
);
