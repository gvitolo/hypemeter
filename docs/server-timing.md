# Server timing debug (Vercel)

È **fatto apposta per seguire** cosa succede **dentro una singola invocazione** della serverless function che renderizza `/` (non crea una “function” Vercel per ogni step: sono **blocchi `timedAsync`** nello stesso handler).

Ogni label (`home:…`, `overlay:…`, …) è uno **step sequenziale o parallelo** misurato nel log della **stessa** Function; così nei **Runtime logs** vedi dove si accumola tempo prima del timeout ~10s (Hobby).

Formato riga: **`nomeStep millisecondi`** (es. `home:fetchMarketSnapshot 842ms`).

## Cosa compare nei log

- Senza env extra, solo gli step **≥ 10s** (`console.warn`) — tipico limite Vercel Hobby; da ottimizzare per primi.
- Con `DEBUG_PAGE_TIMING=1`, anche gli step veloci (`console.log`).

## Log di tutte le sezioni (anche veloci)

Imposta su Vercel (o in `.env.local`):

```bash
DEBUG_PAGE_TIMING=1
```

Poi in **Deployments → Functions → View logs** vedrai ogni step (`home:…`, `overlay:…`, `market:…`, `cpi:…`, `social:…`).

## Etichette utili

| Prefisso | Significato |
|----------|-------------|
| `home:totalWallTime` | Tempo totale della richiesta `/` (SSR). |
| `home:fetchMarketYearlyOverlay` | Overlay storico (include sotto-log `overlay:*` e `cpi:*`). |
| `home:fetchMarketSnapshot` | Sidecar prezzi + sotto-log `market:resolve*`. |
| `social:*` | Reddit / YouTube / Facebook+Jina / Threads+Jina in parallelo. |
| `cpi:fredApi` / `cpi:worldBank` / `cpi:fredGraphCsv` | Catena inflazione live. |

Implementazione: `src/lib/serverTiming.ts`.
