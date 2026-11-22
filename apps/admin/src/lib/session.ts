/** Shared by the proxy (edge of every request) and the server code. No secrets here. */
export const SESSION_COOKIE = "__session";
export const SESSION_DAYS = 5;
export const STAFF_ROLES = ["super_admin", "admin"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(v: unknown): v is StaffRole {
  return STAFF_ROLES.includes(v as StaffRole);
}
