# Pokemon Hype Meter

Gen Z / Alpha style Pokemon sentiment dashboard inspired by CNN Fear & Greed.

The app calculates a live 0-100 hype score using seven equal-weight indicators from current Pokemon news headlines.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build for production

```bash
npm run lint
npm run build
npm run start
```

## Data source

- Live Pokemon headlines from Google News RSS:
  `https://news.google.com/rss/search?q=Pokemon&hl=en-US&gl=US&ceid=US:en`
- The page uses server-side fetch + revalidation every 30 minutes.

## Recommended hosting

For this stack, use **Vercel** first:

- Built by the Next.js team, best compatibility
- Global CDN and automatic HTTPS
- Fast deploy from GitHub in minutes
- Reliable for public consumer traffic

### Deploy on Vercel

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Framework detected as Next.js automatically
4. Click deploy

Optional backup choices: Cloudflare Pages (good) or Netlify (good), but Vercel is usually the most reliable for modern Next.js features.
