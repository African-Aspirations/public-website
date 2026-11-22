import "server-only";
import { schema } from "@aa/db";
import type { Staff } from "./auth";
import { db } from "./db";

/** Record a staff action. Called by every server action that writes. */
export async function audit(
  who: Staff,
  action: string,
  entity: string,
  entityId: string | null,
  diff?: unknown,
) {
  await db()
    .insert(schema.auditLog)
    .values({ firebaseUid: who.uid, action, entity, entityId, diff: diff ?? null });
}
