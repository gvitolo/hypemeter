import { describe, expect, it } from "vitest";
import {
  HOME_POKEMON_RESOLVE_BUDGET_MS,
  HYPEMETER_DATA_REVALIDATE_SEC,
} from "./homePageCacheConfig";

describe("homePageCacheConfig", () => {
  it("gives Pokemon-of-day resolver enough time for cold RSS + PokeAPI on serverless", () => {
    expect(HOME_POKEMON_RESOLVE_BUDGET_MS).toBeGreaterThanOrEqual(10_000);
  });

  it("refreshes home-tagged data on a 5-hour cadence", () => {
    expect(HYPEMETER_DATA_REVALIDATE_SEC).toBe(5 * 60 * 60);
  });
});
