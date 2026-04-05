import { describe, expect, it } from "vitest";
import { homeRefreshPeriodAnchorMs, homeRefreshPeriodEndMs } from "./homeRefreshPeriodAnchor";

describe("homeRefreshPeriodAnchor", () => {
  const periodSec = 5 * 60 * 60;
  const periodMs = periodSec * 1000;

  it("keeps anchor stable within a period", () => {
    const base = 1_700_000_000_000;
    const a = homeRefreshPeriodAnchorMs(base, periodSec);
    const b = homeRefreshPeriodAnchorMs(base + 60_000, periodSec);
    expect(a).toBe(b);
    expect(a % periodMs).toBe(0);
  });

  it("end is anchor + one period", () => {
    const now = 1_700_000_123_456;
    const anchor = homeRefreshPeriodAnchorMs(now, periodSec);
    const end = homeRefreshPeriodEndMs(now, periodSec);
    expect(end - anchor).toBe(periodMs);
    expect(end).toBeGreaterThan(now);
  });
});
