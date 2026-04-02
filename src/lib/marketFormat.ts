export function formatUsd(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatGrowthPct(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatSignedChange(value: number | null, currency: "JPY" | "USD" | null) {
  if (value === null || Number.isNaN(value) || currency === null) {
    return "N/A";
  }
  if (currency === "JPY") {
    const rounded = Math.round(value);
    const sign = rounded > 0 ? "+" : "";
    return `${sign}${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(rounded)} JPY`;
  }
  const abs = Math.abs(value);
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(abs);
  return `${sign}${amount}`;
}

import type { MarketHighlightKey } from "@/lib/marketBacktrack";

/**
 * Sidecar % uses the same hex as chart strokes (`MARKET_CHART`); sign does not switch to red.
 */
export function growthPctColorClass(
  value: number | null,
  series: MarketHighlightKey,
): string {
  const raw = value as unknown;
  const n =
    typeof raw === "string"
      ? Number(raw.trim())
      : typeof raw === "number"
        ? raw
        : NaN;
  if (value === null || raw === undefined || Number.isNaN(n)) {
    if (series === "btc") return "text-[#fbbf24]/90";
    if (series === "nintendo") return "text-[#fb7185]/90";
    if (series === "inflation") return "text-[#818cf8]/90";
    return "text-[#34d399]/90";
  }
  if (n === 0) return "text-slate-300";
  if (series === "btc") return "text-[#fbbf24]";
  if (series === "nintendo") return "text-[#fb7185]";
  if (series === "inflation") return "text-[#818cf8]";
  return "text-[#34d399]";
}
