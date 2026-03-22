import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchMarketYearlyOverlay } from "@/lib/marketBacktrack";

/**
 * Integration-style tests: mock Stooq daily CSV + FRED CPI.
 * Ensures overlay arrays always match history length (client chart expects length === n).
 */

function csvRes(body: string): Response {
  return new Response(body, { status: 200, headers: { "Content-Type": "text/csv" } });
}

/** Minimal FRED-style CSV: December CPI only, rising ~2.5 pts/year for YoY. */
function mockFredCpiCsvFrom2004() {
  const lines = ["observation_date,CPIAUCSL"];
  for (let y = 2004; y <= 2027; y++) {
    lines.push(`${y}-12-01,${(100 + (y - 2004) * 2.5).toFixed(3)}`);
  }
  return lines.join("\n");
}

/** Stooq daily CSV: one row per year (last close in year). */
function mockStooqDailyYearly(startYear: number, endYear: number, base: number, step: number): string {
  const lines = ["Date,Close"];
  for (let y = startYear; y <= endYear; y++) {
    lines.push(`${y}-12-30,${(base + (y - startYear) * step).toFixed(4)}`);
  }
  return lines.join("\n");
}

describe("fetchMarketYearlyOverlay (mocked Stooq + FRED)", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns series with same length as years[] when Stooq returns daily CSV", async () => {
    const years: number[] = [];
    for (let y = 2005; y <= 2026; y += 1) years.push(y);
    const n = years.length;

    const spCsv = mockStooqDailyYearly(2005, 2026, 1000, 50);
    const btcCsv = mockStooqDailyYearly(2005, 2026, 100, 10);
    const ntCsv = mockStooqDailyYearly(2005, 2026, 10, 0.2);
    const fredCsv = mockFredCpiCsvFrom2004();

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("stooq.com/q/d/l") && (url.includes("%5Espx") || url.includes("^spx"))) {
        return csvRes(spCsv);
      }
      if (url.includes("stooq.com/q/d/l") && url.includes("btcusd")) {
        return csvRes(btcCsv);
      }
      if (url.includes("stooq.com/q/d/l") && url.includes("ntdoy")) {
        return csvRes(ntCsv);
      }
      if (url.includes("fred.stlouisfed.org/graph/fredgraph.csv") && url.includes("CPIAUCSL")) {
        return csvRes(fredCsv);
      }
      if (url.includes("api.worldbank.org")) {
        return new Response(
          JSON.stringify([{}, []]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("not found", { status: 404 });
    }) as typeof fetch;

    const overlay = await fetchMarketYearlyOverlay(years);

    expect(overlay.sp500.length).toBe(n);
    expect(overlay.btc.length).toBe(n);
    expect(overlay.nintendo.length).toBe(n);
    expect(overlay.inflation.length).toBe(n);
    expect(overlay.inflationYoY.length).toBe(n);
    expect(overlay.sp500.every((v) => typeof v === "number" && !Number.isNaN(v))).toBe(true);
    expect(overlay.btc.every((v) => typeof v === "number" && !Number.isNaN(v))).toBe(true);
    expect(overlay.nintendo.every((v) => typeof v === "number" && !Number.isNaN(v))).toBe(true);
    expect(overlay.inflation.every((v) => typeof v === "number" && !Number.isNaN(v))).toBe(true);
  });

  it("still returns length-matched placeholder series when upstream returns empty (flat mid-chart)", async () => {
    const years = [2020, 2021, 2022];
    const n = years.length;

    globalThis.fetch = vi.fn(async () => new Response("{}", { status: 200 })) as typeof fetch;

    const overlay = await fetchMarketYearlyOverlay(years);

    expect(overlay.sp500.length).toBe(n);
    expect(overlay.btc.length).toBe(n);
    expect(overlay.nintendo.length).toBe(n);
    expect(overlay.inflation.length).toBe(n);
    expect(overlay.inflationYoY.length).toBe(n);
  });
});
