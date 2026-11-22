"use server";
import { revalidatePath } from "next/cache";
import { audit } from "./audit";
import { requireStaff } from "./auth";
import { isKind, isStatus, setStatus } from "./enquiries";

/** Move an enquiry between new / contacted / closed. */
export async function updateEnquiryStatus(kind: string, id: string, status: string) {
  const me = await requireStaff();
  if (!isKind(kind) || !isStatus(status)) return;
  const from = await setStatus(kind, id, status);
  if (from === null) return;
  await audit(me, "status", kind === "listing" ? "listing_inquiry" : "contact_message", id, {
    from,
    to: status,
  });
  revalidatePath("/", "layout"); // counts in the sidebar and overview
}
