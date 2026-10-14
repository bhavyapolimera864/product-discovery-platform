import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbAvailable = !!db;
  let dbOk = false;

  if (db) {
    try {
      await db.execute(sql`select 1`);
      dbOk = true;
    } catch {
      dbOk = false;
    }
  }

  return Response.json({
    ok: true,
    database: dbAvailable ? (dbOk ? "connected" : "error") : "not configured (using mock data)",
    mode: dbAvailable ? "database" : "mock",
    timestamp: new Date().toISOString(),
  });
}
