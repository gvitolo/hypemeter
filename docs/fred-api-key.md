# FRED API key (optional)

CPI inflation on the hype chart uses [CPIAUCSL](https://fred.stlouisfed.org/series/CPIAUCSL).

1. Request a **free** API key: [FRED API key](https://fred.stlouisfed.org/docs/api/api_key.html).
2. In Vercel (or locally), set **`FRED_API_KEY`**.
3. Redeploy.

If unset, the app falls back to the public graph CSV (`fredgraph.csv`). The official [series observations API](https://fred.stlouisfed.org/docs/api/fred/series_observations.html) is more reliable on some hosts.
