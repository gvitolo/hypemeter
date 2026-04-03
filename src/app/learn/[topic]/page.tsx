import Link from "next/link";
import { notFound } from "next/navigation";

type TopicPage = {
  title: string;
  intro: string;
  points: string[];
  monmeter: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

const TOPIC_CONTENT: Record<string, TopicPage> = {
  "live-event-signals": {
    title: "Live Event Signals",
    intro:
      "This card summarizes fresh event catalysts detected from current headlines, release windows, and high-impact topic clusters.",
    points: [
      "Higher-weight signals imply stronger short-term narrative impact.",
      "Cluster repetition across sources increases confidence.",
      "Signal lists are now fallback-protected, so the panel is never empty.",
    ],
    monmeter:
      "Monmeter uses these signals as one of the catalyst layers feeding quality and narrative context, not as a standalone prediction.",
  },
  "community-hype": {
    title: "Pokemon Community Hype",
    intro:
      "Community Hype tracks social participation and attention momentum across monitored channels.",
    points: [
      "Higher values suggest stronger audience engagement and discovery pressure.",
      "Mixed or declining values can indicate fading attention cycles.",
      "Spikes can be temporary; consistency over time is more meaningful.",
    ],
    monmeter:
      "In Monmeter, this score contributes to the community side of the model and is blended with market-side signals.",
  },
  "market-heat": {
    title: "Pokemon TCG Market Heat",
    intro:
      "Market Heat captures how intense market-side conditions are, including momentum, pressure, and pricing behavior.",
    points: [
      "High heat often aligns with stronger demand/velocity phases.",
      "Low heat can indicate consolidation or softer speculative appetite.",
      "Heat is descriptive of current regime, not a guarantee of continuation.",
    ],
    monmeter:
      "Monmeter uses Market Heat to represent the market component that complements the community component.",
  },
  "signal-quality": {
    title: "Signal Quality",
    intro:
      "Signal Quality is a confidence layer that evaluates how reliable the current data environment appears.",
    points: [
      "It rewards source diversity, coverage depth, and coherent signal density.",
      "It penalizes concentration and noisy/low-trust conditions.",
      "A higher value means the model context is stronger, not risk-free.",
    ],
    monmeter:
      "In Monmeter, Signal Quality helps calibrate trust in current readings and narrative framing.",
  },
  "model-weights": {
    title: "Model Weights",
    intro:
      "Model Weights define how each major component contributes to the final hype score.",
    points: [
      "Search Interest: 26%",
      "Market Momentum: 20%, Availability Pressure: 18%, Event Catalyst: 14%",
      "Community Sentiment: 11%, Product Stress: 11%",
    ],
    monmeter:
      "Monmeter combines weighted components into one composite index to balance speed, breadth, and robustness.",
  },
  "sentiment-1m": {
    title: "1 Month Sentiment",
    intro:
      "Short-horizon read of recent market/community tone and momentum conditions.",
    points: [
      "Reacts fastest to current shifts.",
      "Useful for tactical risk-on/risk-off posture.",
      "More sensitive to transient noise.",
    ],
    monmeter:
      "This window emphasizes near-term movement and quick narrative changes.",
  },
  "sentiment-1y": {
    title: "1 Year Sentiment",
    intro:
      "Medium-horizon regime view that smooths short noise and captures durable trend posture.",
    points: [
      "Balances tactical and structural signals.",
      "Less jumpy than 1-month window.",
      "Useful for intermediate positioning bias.",
    ],
    monmeter:
      "This window blends market rhythm with social strength over a broader cycle.",
  },
  "sentiment-5y": {
    title: "5 Year Sentiment",
    intro:
      "Long-horizon context that compares current state against multi-year behavior.",
    points: [
      "Best for structural backdrop, not short-term timing.",
      "Helps identify whether current regime is unusually strong/weak.",
      "Moves slowly by design.",
    ],
    monmeter:
      "This window anchors the dashboard in long-cycle context to reduce overreaction.",
  },
  "social-google-search": {
    title: "Social Signal Pulse - Google Search",
    intro:
      "Shows search demand level and day-over-day change, acting as a broad attention proxy.",
    points: [
      "Rising values suggest expanding discovery demand.",
      "Sharp drops can indicate cooling interest.",
      "Search often leads, but confirmation from other channels matters.",
    ],
    monmeter:
      "Monmeter uses this as a high-coverage demand signal in the social pulse mix.",
  },
  "social-reddit": {
    title: "Social Signal Pulse - Reddit",
    intro:
      "Tracks discussion intensity and participation in community-led threads.",
    points: [
      "Strong growth suggests active grassroots engagement.",
      "Thread quality and context matter, not only volume.",
      "Useful to detect narrative shifts early.",
    ],
    monmeter:
      "Reddit contributes to community breadth and momentum in social pulse scoring.",
  },
  "social-youtube": {
    title: "Social Signal Pulse - YouTube",
    intro:
      "Captures video-driven attention and creator ecosystem activity.",
    points: [
      "High values can reflect launch/reveal amplification.",
      "Sustained performance is stronger than one-day spikes.",
      "Useful for trend reinforcement checks.",
    ],
    monmeter:
      "YouTube helps quantify content-led narrative expansion in Monmeter.",
  },
  "social-facebook": {
    title: "Social Signal Pulse - Facebook",
    intro:
      "Measures broad social reach and mainstream engagement behavior.",
    points: [
      "Stable growth indicates wider audience participation.",
      "Can lag early-adopter channels but confirm mainstream adoption.",
      "Useful for breadth confirmation.",
    ],
    monmeter:
      "Facebook is included as a broad-reach validation layer in social pulse.",
  },
  "social-threads": {
    title: "Social Signal Pulse - Threads",
    intro:
      "Tracks short-form social velocity and fast narrative propagation.",
    points: [
      "Useful for early burst detection.",
      "High volatility is common and expected.",
      "Best interpreted with cross-channel confirmation.",
    ],
    monmeter:
      "Threads contributes high-speed momentum context to the social mix.",
  },
  "social-pokemon-official": {
    title: "Social Signal Pulse - Pokemon Official",
    intro:
      "Monitors official channel activity and direct publisher-side communication impact.",
    points: [
      "Official activity can trigger strong event and sentiment reactions.",
      "Announcements often precede broader social propagation.",
      "Best read together with community response channels.",
    ],
    monmeter:
      "This channel adds first-party signal quality to the social pulse layer.",
  },
  "component-search-interest": {
    title: "Component - Search Interest",
    intro:
      "Search Interest measures demand intensity from search behavior, then blends it with social acceleration context.",
    points: [
      "Weight in model: 26% (highest single component).",
      "Higher values indicate stronger discovery demand and audience pull.",
      "Can react quickly to reveals, launches, and trend bursts.",
    ],
    monmeter:
      "This component is a core demand driver in Monmeter and heavily influences short-term score movement.",
  },
  "component-market-momentum": {
    title: "Component - Market Momentum",
    intro:
      "Market Momentum reflects ongoing trend strength in market-linked pricing behavior.",
    points: [
      "Weight in model: 20%.",
      "Higher values suggest stronger trend persistence on market-side signals.",
      "Lower values can point to loss of follow-through or range conditions.",
    ],
    monmeter:
      "Monmeter uses this to represent directional market force rather than one-off price noise.",
  },
  "component-availability-pressure": {
    title: "Component - Availability Pressure",
    intro:
      "Availability Pressure captures scarcity and supply stress patterns around sellouts, preorders, and stock tightness.",
    points: [
      "Weight in model: 18%.",
      "Higher values suggest tighter availability and stronger scarcity pressure.",
      "Lower values suggest easier supply conditions or less friction.",
    ],
    monmeter:
      "This component helps explain when access constraints are amplifying hype dynamics.",
  },
  "component-release-catalyst": {
    title: "Component - Release/Event Catalyst",
    intro:
      "Release/Event Catalyst measures impact from reveal/release cycles with social confirmation.",
    points: [
      "Weight in model: 14%.",
      "Detects event-driven boosts tied to launches and announcements.",
      "Works best with cross-source and cross-platform confirmation.",
    ],
    monmeter:
      "Monmeter uses this as a catalyst layer that can accelerate score changes during event windows.",
  },
  "component-community-sentiment": {
    title: "Component - Community Sentiment",
    intro:
      "Community Sentiment blends tone and participation behavior from community channels.",
    points: [
      "Weight in model: 11%.",
      "Higher values suggest constructive tone plus broad social participation.",
      "Lower values can reflect skepticism, fragmentation, or weaker engagement quality.",
    ],
    monmeter:
      "This component captures mood quality, not just raw volume, inside the social community layer.",
  },
  "component-product-stress": {
    title: "Component - Product Stress / Queue",
    intro:
      "Product Stress tracks operational friction such as queues, delays, restrictions, and fulfillment stress.",
    points: [
      "Weight in model: 11%.",
      "Higher values indicate more operational pressure in the ecosystem.",
      "Helps flag frictions that can distort demand or execution quality.",
    ],
    monmeter:
      "Monmeter uses Product Stress as a risk/friction lens to contextualize hype under operational strain.",
  },
};

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const content = TOPIC_CONTENT[topic];
  if (!content) notFound();

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
          <p className="text-[11px] uppercase tracking-[0.14em] text-cyan-300">Card Explanation</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{content.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">{content.intro}</p>
          <ul className="mt-5 grid gap-2">
            {content.points.map((point) => (
              <li key={point} className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-300">
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-sm leading-relaxed text-slate-200">
            {content.monmeter}
          </p>
        </section>
      </div>
    </main>
  );
}
