"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MarketHighlightKey, MarketYearlyOverlay } from "@/lib/marketBacktrack";
import { formatGrowthPct, formatSignedChange, formatUsd, growthPctColorClass } from "@/lib/marketFormat";
import {
  BINANCE_BTC_USDT,
  COINGECKO_BTC,
  STOOQ_QUOTE_7974_JP,
  STOOQ_QUOTE_BTCUSD,
  STOOQ_QUOTE_SPX,
  FRED_CPIAUCSL_SERIES,
} from "@/lib/yahooQuotes";

type YearScore = { year: number; score: number };

type MarketSnap = {
  sp500: number | null;
  bitcoin: number | null;
  nintendo: number | null;
  nintendoPreviousClose: number | null;
  nintendoChangeAbs: number | null;
  nintendoChangeCurrency: "JPY" | "USD" | null;
  sp500GrowthPct: number | null;
  bitcoinGrowthPct: number | null;
  nintendoGrowthPct: number | null;
  updatedAt: string | null;
  nintendoSource: "adr" | "tokyo" | null;
  sp500Source: "stooq" | "stooq-daily" | "yahoo" | null;
  bitcoinSource: "stooq" | "stooq-daily" | "coingecko" | "binance" | null;
};

const SP500_SOURCE_NOTE: Record<NonNullable<MarketSnap["sp500Source"]>, string> = {
  stooq: "Stooq",
  "stooq-daily": "Stooq daily",
  yahoo: "Yahoo",
};

const BTC_SOURCE_NOTE: Record<NonNullable<MarketSnap["bitcoinSource"]>, string> = {
  stooq: "Stooq",
  "stooq-daily": "Stooq daily",
  coingecko: "CoinGecko",
  binance: "Binance (1d)",
};

const SIDECAR_POLL_MS = 60 * 60 * 1000;
const SIDECAR_FETCH_TIMEOUT_MS = 10_000;
const SIDECAR_RETRY_ATTEMPTS = 3;
const SIDECAR_STORAGE_KEY = "hypemeter_market_sidecar_last_good_v1";

function parseMarketSnapFromApi(raw: unknown): MarketSnap | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const numOrNull = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  const strOrNull = (v: unknown) => (typeof v === "string" ? v : null);
  return {
    sp500: numOrNull(o.sp500),
    bitcoin: numOrNull(o.bitcoin),
    nintendo: numOrNull(o.nintendo),
    nintendoPreviousClose: numOrNull(o.nintendoPreviousClose),
    nintendoChangeAbs: numOrNull(o.nintendoChangeAbs),
    nintendoChangeCurrency:
      o.nintendoChangeCurrency === "JPY" || o.nintendoChangeCurrency === "USD"
        ? o.nintendoChangeCurrency
        : null,
    sp500GrowthPct: numOrNull(o.sp500GrowthPct),
    bitcoinGrowthPct: numOrNull(o.bitcoinGrowthPct),
    nintendoGrowthPct: numOrNull(o.nintendoGrowthPct),
    updatedAt: strOrNull(o.updatedAt),
    nintendoSource: o.nintendoSource === "tokyo" || o.nintendoSource === "adr" ? o.nintendoSource : null,
    sp500Source:
      o.sp500Source === "stooq" ||
      o.sp500Source === "stooq-daily" ||
      o.sp500Source === "yahoo"
        ? o.sp500Source
        : null,
    bitcoinSource:
      o.bitcoinSource === "stooq" ||
      o.bitcoinSource === "stooq-daily" ||
      o.bitcoinSource === "coingecko" ||
      o.bitcoinSource === "binance"
        ? o.bitcoinSource
        : null,
  };
}

function hasAnyQuote(row: MarketSnap): boolean {
  return row.sp500 !== null || row.bitcoin !== null || row.nintendo !== null;
}

function readStoredMarketSnap(): MarketSnap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SIDECAR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = parseMarketSnapFromApi(JSON.parse(raw));
    return parsed && hasAnyQuote(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredMarketSnap(row: MarketSnap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIDECAR_STORAGE_KEY, JSON.stringify(row));
  } catch {
    /* ignore storage errors */
  }
}

type Props = {
  initialMarket: MarketSnap;
  marketOverlay: MarketYearlyOverlay;
  history: YearScore[];
  deploymentSha?: string | null;
  highlight: MarketHighlightKey | null;
  setHighlight: (k: MarketHighlightKey | null) => void;
};

export function MarketSidecarAside({
  initialMarket,
  marketOverlay,
  history,
  deploymentSha,
  highlight,
  setHighlight,
}: Props) {
  const [market, setMarket] = useState<MarketSnap>(initialMarket);
  const refreshInFlight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    setMarket(initialMarket);
    if (hasAnyQuote(initialMarket)) writeStoredMarketSnap(initialMarket);
  }, [initialMarket]);

  const refreshFromApi = useCallback(async () => {
    if (refreshInFlight.current) return refreshInFlight.current;
    refreshInFlight.current = (async () => {
      for (let attempt = 0; attempt < SIDECAR_RETRY_ATTEMPTS; attempt += 1) {
        try {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), SIDECAR_FETCH_TIMEOUT_MS);
          const cacheBust = `t=${Date.now()}`;
          const res = await fetch(`/api/market-snapshot?${cacheBust}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          window.clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`http_${res.status}`);
          const parsed = parseMarketSnapFromApi(await res.json());
          if (parsed && hasAnyQuote(parsed)) {
            setMarket(parsed);
            writeStoredMarketSnap(parsed);
            return;
          }
          throw new Error("invalid_payload");
        } catch {
          if (attempt === SIDECAR_RETRY_ATTEMPTS - 1) return;
          const backoffMs = 350 * 2 ** attempt + Math.floor(Math.random() * 140);
          await new Promise((resolve) => window.setTimeout(resolve, backoffMs));
        }
      }
    })().finally(() => {
      refreshInFlight.current = null;
    });
    return refreshInFlight.current;
  }, []);

  useEffect(() => {
    const stored = readStoredMarketSnap();
    if (stored) setMarket((current) => (hasAnyQuote(current) ? current : stored));
    void refreshFromApi();
    const intervalId = window.setInterval(() => void refreshFromApi(), SIDECAR_POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshFromApi();
    };
    const onOnline = () => void refreshFromApi();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
    };
  }, [refreshFromApi]);

  const sp500Href = STOOQ_QUOTE_SPX;
  const btcHref =
    market.bitcoinSource === "binance"
      ? BINANCE_BTC_USDT
      : market.bitcoinSource === "coingecko"
        ? COINGECKO_BTC
        : STOOQ_QUOTE_BTCUSD;

  const inflationSidecar = useMemo(() => {
    const y = marketOverlay.inflationYoY;
    if (!y.length) return { hasData: false as const, pct: null as number | null, year: null as number | null };
    const spread = Math.max(...y) - Math.min(...y);
    if (spread < 1e-6) return { hasData: false as const, pct: null, year: null };
    const pct = y[y.length - 1] ?? null;
    const lastIdx = y.length - 1;
    const year =
      lastIdx >= 0 && history[lastIdx]?.year !== undefined
        ? history[lastIdx]!.year
        : (history[history.length - 1]?.year ?? null);
    return { hasData: true as const, pct, year };
  }, [marketOverlay.inflationYoY, history]);

  const nintendoChangeDisplay = formatSignedChange(market.nintendoChangeAbs, market.nintendoChangeCurrency);

  return (
    <aside className="relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-3 hover-lift sm:p-4 lg:w-auto lg:max-w-none lg:shrink-0">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Market Sidecar</p>

      <div className="mt-3 space-y-2">
        <a
          href={sp500Href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col gap-1 rounded-xl border bg-slate-900/90 px-3 py-2.5 transition-colors hover:bg-slate-900 ${
            highlight === "sp500"
              ? "border-emerald-400/70 ring-1 ring-emerald-400/30"
              : "border-white/10 hover:border-emerald-400/45"
          }`}
          onMouseEnter={() => setHighlight("sp500")}
          onMouseLeave={() => setHighlight(null)}
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
            S&P 500
            {market.sp500Source ? (
              <span className="font-normal normal-case text-slate-600">
                {" "}
                · {SP500_SOURCE_NOTE[market.sp500Source]}
              </span>
            ) : null}
          </p>
          <p
            className={`text-xl font-bold tabular-nums leading-tight sm:text-2xl ${growthPctColorClass(market.sp500GrowthPct, "sp500")}`}
          >
            {formatGrowthPct(market.sp500GrowthPct)}
          </p>
          <p className="text-[11px] leading-snug text-slate-500">level: {formatUsd(market.sp500)}</p>
        </a>
        <a
          href={btcHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col gap-1 rounded-xl border bg-slate-900/90 px-3 py-2.5 transition-colors hover:bg-slate-900 ${
            highlight === "btc"
              ? "border-amber-400/70 ring-1 ring-amber-400/30"
              : "border-white/10 hover:border-amber-400/45"
          }`}
          onMouseEnter={() => setHighlight("btc")}
          onMouseLeave={() => setHighlight(null)}
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
            Bitcoin
            {market.bitcoinSource ? (
              <span className="font-normal normal-case text-slate-600">
                {" "}
                · {BTC_SOURCE_NOTE[market.bitcoinSource]}
              </span>
            ) : null}
          </p>
          <p
            className={`text-xl font-bold tabular-nums leading-tight sm:text-2xl ${growthPctColorClass(market.bitcoinGrowthPct, "btc")}`}
          >
            {formatGrowthPct(market.bitcoinGrowthPct)}
          </p>
          <p className="text-[11px] leading-snug text-slate-500">level: {formatUsd(market.bitcoin)}</p>
        </a>
        <a
          href={STOOQ_QUOTE_7974_JP}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col gap-1 rounded-xl border bg-slate-900/90 px-3 py-2.5 transition-colors hover:bg-slate-900 ${
            highlight === "nintendo"
              ? "border-rose-400/70 ring-1 ring-rose-400/30"
              : "border-white/10 hover:border-rose-400/45"
          }`}
          onMouseEnter={() => setHighlight("nintendo")}
          onMouseLeave={() => setHighlight(null)}
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
            {market.nintendoSource === "tokyo" ? "Nintendo (Tokyo)" : "Nintendo (NTDOY)"}
          </p>
          <p
            className={`text-xl font-bold tabular-nums leading-tight sm:text-2xl ${growthPctColorClass(market.nintendoGrowthPct, "nintendo")}`}
          >
            {formatGrowthPct(market.nintendoGrowthPct)}
          </p>
          <p className="text-[11px] leading-snug text-slate-500">
            {nintendoChangeDisplay !== "N/A" ? `${nintendoChangeDisplay} · ` : ""}
            level: {formatUsd(market.nintendo)}
            {market.nintendoSource === "tokyo" ? " (USD est.)" : ""}
            {market.nintendoPreviousClose !== null ? (
              <span className="text-slate-500"> · prev {formatUsd(market.nintendoPreviousClose)}</span>
            ) : null}
          </p>
        </a>
        <a
          href={FRED_CPIAUCSL_SERIES}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col gap-1 rounded-xl border bg-slate-900/90 px-3 py-2.5 transition-colors hover:bg-slate-900 ${
            highlight === "inflation"
              ? "border-indigo-400/70 ring-1 ring-indigo-400/30"
              : "border-white/10 hover:border-indigo-400/45"
          }`}
          onMouseEnter={() => setHighlight("inflation")}
          onMouseLeave={() => setHighlight(null)}
        >
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
            US CPI inflation{" "}
            <span className="font-normal normal-case text-slate-600">· FRED CPIAUCSL YoY</span>
          </p>
          <p
            className={`text-xl font-bold tabular-nums leading-tight sm:text-2xl ${growthPctColorClass(
              inflationSidecar.hasData ? inflationSidecar.pct : null,
              "inflation",
            )}`}
          >
            {inflationSidecar.hasData && inflationSidecar.pct !== null
              ? formatGrowthPct(inflationSidecar.pct)
              : "N/A"}
          </p>
          <p className="text-[11px] leading-snug text-slate-500">
            {inflationSidecar.hasData && inflationSidecar.year !== null
              ? `Latest in chart: ${inflationSidecar.year} (YoY %)`
              : "CPI YoY from monthly index (overlay)"}
          </p>
        </a>
      </div>

      <p className="mt-2 text-[10px] leading-tight text-slate-600">
        {market.updatedAt ?? "—"} · {deploymentSha ?? "local"}
      </p>
    </aside>
  );
}
