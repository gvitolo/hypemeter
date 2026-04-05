import { HYPEMETER_DATA_REVALIDATE_SEC } from "@/lib/homePageCacheConfig";

/**
 * Wall-clock-aligned start of the current home refresh period (Unix ms).
 * Using this for “next update” UI keeps the countdown stable across reloads
 * even when the server payload uses a fresh `Date.now()` per request (e.g. instant path).
 */
export function homeRefreshPeriodAnchorMs(
  nowMs: number = Date.now(),
  periodSec: number = HYPEMETER_DATA_REVALIDATE_SEC,
): number {
  const periodMs = periodSec * 1000;
  return Math.floor(nowMs / periodMs) * periodMs;
}

/** Unix ms when the current period ends (exclusive boundary = next anchor). */
export function homeRefreshPeriodEndMs(
  nowMs: number = Date.now(),
  periodSec: number = HYPEMETER_DATA_REVALIDATE_SEC,
): number {
  return homeRefreshPeriodAnchorMs(nowMs, periodSec) + periodSec * 1000;
}
