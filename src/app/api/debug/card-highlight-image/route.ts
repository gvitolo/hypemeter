import {
  getCardHighlightImageDebugPayload,
} from "@/lib/debugCardTraderPayloads";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Diagnose Card Highlight image pipeline (seller parse + upstream fetch).
 * Same JSON as {@link getCardHighlightImageDebugPayload} (used by `/debug`).
 */
export async function GET() {
  return NextResponse.json(await getCardHighlightImageDebugPayload());
}
