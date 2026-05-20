import { upsertRuntimeSnapshotToDb } from "@/lib/staticDataDb";

/** SQLite runtime snapshot key; must match homepage read paths in `app/page.tsx`. */
export const HOME_PAGE_RUNTIME_SNAPSHOT_KEY = "home_page_payload_v1";

/**
 * Re-runs the uncached home pipeline and persists the runtime snapshot.
 * Uses a dynamic import of `@/app/page` so cron/manual revalidate routes do not
 * statically depend on the homepage module graph (avoids heavy or brittle cold init).
 *
 * This is intentionally the only place that should block on full external refresh work.
 * The homepage itself renders snapshot-first and schedules refreshes after the response.
 */
export async function refreshHomePageRuntimeSnapshot() {
  const { loadHomePageDataUncached } = await import("@/app/page");
  const fresh = await loadHomePageDataUncached();
  upsertRuntimeSnapshotToDb(HOME_PAGE_RUNTIME_SNAPSHOT_KEY, {
    payload: fresh,
    updatedAtMs: Date.now(),
  });
  return fresh;
}
