import Link from "next/link";

export default function MomentumPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-cyan-200 transition-colors hover:bg-cyan-400/20"
          >
            Back to Monmeter
          </Link>
        </div>

        <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-300">Market Term</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Momentum</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
            Momentum is the tendency of price to keep moving in the same direction for a period of time. In practice,
            assets with stronger recent returns can continue outperforming, while weak assets can keep underperforming.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">What It Captures</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Directional persistence, trend acceleration, and whether buyers or sellers still control the tape.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">How To Read It</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                High momentum suggests trends are being confirmed. Low momentum suggests trend fatigue or more range
                behavior.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Monmeter Context</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                In Monmeter this label summarizes whether cross-signal market inputs are moving with consistent force.
                It is descriptive, not a direct buy or sell command.
              </p>
            </article>
          </div>
          <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Quick Interpretation</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Strong momentum means continuation risk/reward is often better. Weak momentum usually calls for tighter
              risk controls and less aggressive positioning.
            </p>
          </div>
        </section>

        <footer className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Source</p>
          <a
            href="https://en.wikipedia.org/wiki/Momentum_(finance)"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-sm text-cyan-300 underline decoration-cyan-400/60 underline-offset-2"
          >
            Wikipedia - Momentum (finance)
          </a>
        </footer>
      </div>
    </main>
  );
}
