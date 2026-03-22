import { describe, expect, it } from "vitest";
import {
  alignYearSeries,
  buildCpiYoYPercentByYearFromMonthlyRows,
  normalizeTo100,
  parseFredCpiCsvToMonthlyRows,
  parseFredCpiCsvToMonthlyRowsFromTail,
  parseStooqDailyHistoryToYearlyLastClose,
  seriesHasVariance,
} from "@/lib/marketBacktrack";

describe("marketBacktrack", () => {
  it("alignYearSeries uses placeholder when no series data (still drawable overlays)", () => {
    const years = [2020, 2021, 2022];
    const empty = new Map<number, number>();
    expect(alignYearSeries(years, empty)).toEqual([50, 50, 50]);
  });

  it("alignYearSeries forward-fills from first known close", () => {
    const years = [2020, 2021, 2022];
    const m = new Map<number, number>([
      [2020, 100],
      [2021, 110],
      [2022, 120],
    ]);
    expect(alignYearSeries(years, m)).toEqual([100, 110, 120]);
  });

  it("normalizeTo100 maps constant series to mid-chart (50), with optional bias", () => {
    expect(normalizeTo100([5, 5, 5])).toEqual([50, 50, 50]);
    expect(normalizeTo100([5, 5, 5], { degenerateBias: 0.5 })).toEqual([50.5, 50.5, 50.5]);
  });

  it("normalizeTo100 maps min→0 and max→100", () => {
    expect(normalizeTo100([10, 20])).toEqual([0, 100]);
  });

  it("seriesHasVariance detects flat series", () => {
    expect(seriesHasVariance([50, 50, 50])).toBe(false);
    expect(seriesHasVariance([50, 51, 50])).toBe(true);
  });

  it("FRED CPI CSV → YoY map (Dec vs prior Dec)", () => {
    const csv = `observation_date,CPIAUCSL
2004-12-01,100.000
2005-12-01,103.000
2006-12-01,106.000`;
    const rows = parseFredCpiCsvToMonthlyRows(csv);
    const map = buildCpiYoYPercentByYearFromMonthlyRows(rows);
    expect(map.get(2005)).toBeCloseTo(3, 5);
    expect(map.get(2006)).toBeCloseTo((106 / 103 - 1) * 100, 5);
  });

  it("FRED CPI tail parse matches full parse for recent window (avoids parsing full graph CSV)", () => {
    const lines = ["observation_date,CPIAUCSL"];
    for (let y = 1960; y <= 2010; y += 1) {
      lines.push(`${y}-12-01,${(100 + (y - 1960) * 0.4).toFixed(3)}`);
    }
    const huge = lines.join("\n");
    const full = parseFredCpiCsvToMonthlyRows(huge);
    const tail = parseFredCpiCsvToMonthlyRowsFromTail(huge, 48);
    const mapFull = buildCpiYoYPercentByYearFromMonthlyRows(full);
    const mapTail = buildCpiYoYPercentByYearFromMonthlyRows(tail);
    expect(mapTail.get(2010)).toBe(mapFull.get(2010));
  });

  it("FRED CSV skips blank cells (do not coerce Number('') to 0)", () => {
    const csv = `observation_date,CPIAUCSL
2025-09-01,324.000
2025-10-01,
2025-11-01,325.000`;
    const rows = parseFredCpiCsvToMonthlyRows(csv);
    const byM = new Map(rows.map((r) => [`${r.y}-${r.m}`, r.cpi]));
    expect(byM.get("2025-9")).toBe(324);
    expect(byM.get("2025-10")).toBeUndefined();
    expect(byM.get("2025-11")).toBe(325);
  });

  it("parseStooqDailyHistoryToYearlyLastClose keeps last close per year", () => {
    const csv = `Date,Open,High,Low,Close,Volume
2019-06-01,1,1,1,10,1
2019-12-30,1,1,1,20,1
2020-06-01,1,1,1,30,1`;
    const m = parseStooqDailyHistoryToYearlyLastClose(csv);
    expect(m.get(2019)).toBe(20);
    expect(m.get(2020)).toBe(30);
  });
});
