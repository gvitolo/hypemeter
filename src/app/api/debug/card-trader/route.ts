import { getCardTraderJinaDebugPayload } from "@/lib/debugCardTraderPayloads";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Inspect CardTrader + Jina parsing. Same JSON as {@link getCardTraderJinaDebugPayload}.
 */
export async function GET() {
  return NextResponse.json(await getCardTraderJinaDebugPayload());
}
