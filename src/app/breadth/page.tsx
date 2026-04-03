import Link from "next/link";

export default function BreadthPage() {
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
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Breadth</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
            Breadth measures participation in a move: how many components are advancing versus declining. A stronger
            trend usually has broad participation, while narrow leadership can be more fragile.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Typical Proxies</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Advance/decline behavior, ratio of gainers to losers, and whether participation expands or contracts.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Why It Matters</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Broad participation supports durability. Narrow participation can signal concentration risk and weaker
                follow-through.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/55 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">Monmeter Context</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                In Monmeter breadth describes how aligned the overall signal ecosystem is. Higher breadth means more
                parts of the market narrative are confirming each other.
              </p>
            </article>
          </div>
          <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Quick Interpretation</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              If only a few names are carrying the move, breadth is usually weaker. If participation is wide, trend
              quality is usually stronger.
            </p>
          </div>
        </section>

        <footer className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Source</p>
          <a
            href="https://en.wikipedia.org/wiki/Breadth_of_market"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-sm text-cyan-300 underline decoration-cyan-400/60 underline-offset-2"
          >
            Wikipedia - Breadth of market
          </a>
        </footer>
      </div>
    </main>
  );
}
