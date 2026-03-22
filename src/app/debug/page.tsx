import { loadHomePageDataUncached } from "@/app/page";
import {
  getCardHighlightImageDebugPayload,
  getCardTraderJinaDebugPayload,
} from "@/lib/debugCardTraderPayloads";
import { runWithTimingCollector } from "@/lib/serverTiming";
import type { Metadata } from "next";
import type { ReactNode } from "react";

/** Must read env at request time on Vercel (not at build). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Debug · Monmeter",
  robots: { index: false, follow: false },
};

function isDebugTimingEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.ENABLE_DEBUG_TIMING_PAGE === "1";
}

/** Shown on /debug so you can tell if Vercel deployed the latest Git push (Settings → Git → Deployments). */
function deployLabel(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
  if (sha) return sha.slice(0, 7);
  return "local-dev";
}

export default async function DebugPage() {
  const [cardHighlightPayload, cardTraderPayload] = await Promise.all([
    getCardHighlightImageDebugPayload(),
    getCardTraderJinaDebugPayload(),
  ]);
  const ref = deployLabel();

  let timingBlock: ReactNode = null;
  if (isDebugTimingEnabled()) {
    const { spans, totalMs } = await runWithTimingCollector(() => loadHomePageDataUncached());
    const maxMs = Math.max(1, ...spans.map((s) => s.ms));
    timingBlock = (
      <>
        <h2 className="mt-10 text-lg font-semibold text-cyan-300">SSR timing (full home pipeline)</h2>
        <p className="mt-1 text-sm text-slate-400">
          This request total: <span className="font-mono text-slate-200">{totalMs}ms</span>. Same as{" "}
          <code className="rounded bg-slate-800 px-1">loadHomePageDataUncached</code>.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Step</th>
                <th className="px-3 py-2">ms</th>
                <th className="min-w-[8rem] px-3 py-2">share</th>
              </tr>
            </thead>
            <tbody>
              {spans.map((row, index) => (
                <tr key={`${index}-${row.label}`} className="border-b border-white/5 hover:bg-slate-900/40">
                  <td className="px-3 py-2 font-mono text-xs text-slate-200">{row.label}</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-cyan-300">{row.ms}</td>
                  <td className="px-3 py-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-500/70"
                        style={{ width: `${(row.ms / maxMs) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Heavy on production — use sparingly. Disable by removing{" "}
          <code className="rounded bg-slate-800 px-1">ENABLE_DEBUG_TIMING_PAGE</code>.
        </p>
      </>
    );
  } else {
    timingBlock = (
      <section className="mt-10 rounded-xl border border-white/10 bg-slate-900/40 p-4">
        <h2 className="text-lg font-semibold text-slate-400">SSR timing</h2>
        <p className="mt-2 text-sm text-slate-500">
          Set <code className="rounded bg-slate-800 px-1">ENABLE_DEBUG_TIMING_PAGE=1</code> on Vercel to show
          the full timing table here (runs one home pipeline per page load). In dev it is always enabled.
        </p>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 md:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-cyan-300">Debug · Monmeter</h1>
        <p className="mt-2 text-sm text-slate-400">
          Internal diagnostics. Payloads are built server-side (same as{" "}
          <code className="rounded bg-slate-800 px-1">GET /api/debug/card-highlight-image</code> and{" "}
          <code className="rounded bg-slate-800 px-1">GET /api/debug/card-trader</code>
          ). Run <code className="rounded bg-slate-800 px-1">npm run debug:card</code> to save JSON to{" "}
          <code className="rounded bg-slate-800 px-1">last-card-debug.json</code>.
        </p>
        <p className="mt-3 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Deploy Git:</span>{" "}
          <code className="text-cyan-300/90">{ref}</code>
          {ref === "local-dev" ? (
            <span className="text-slate-500"> — vedi qui i cambiamenti con </span>
          ) : (
            <span className="text-slate-500"> — se su Vercel questo non si aggiorna dopo un push, apri il progetto → </span>
          )}
          <span className="text-slate-500">
            Deployments e verifica che l&apos;ultimo deploy sia da branch <code className="text-slate-300">main</code> del repo
            collegato.
          </span>
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-amber-200/95">Card highlight image</h2>
          <pre className="mt-2 max-h-[min(70vh,32rem)] overflow-auto rounded-xl border border-white/10 bg-slate-900/90 p-3 text-xs leading-relaxed text-slate-200">
            {JSON.stringify(cardHighlightPayload, null, 2)}
          </pre>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-amber-200/95">CardTrader + Jina</h2>
          <pre className="mt-2 max-h-[min(70vh,32rem)] overflow-auto rounded-xl border border-white/10 bg-slate-900/90 p-3 text-xs leading-relaxed text-slate-200">
            {JSON.stringify(cardTraderPayload, null, 2)}
          </pre>
        </section>

        {timingBlock}
      </div>
    </main>
  );
}
