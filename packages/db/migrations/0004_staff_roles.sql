-- Staff roles renamed: admin → super_admin (manages users), editor → admin (everything else).
-- Order matters: free the name "admin" first. Firebase custom claims (staff_role) must be
-- updated to match: rerun apps/admin/scripts/create-admin.ts for each existing staff member.
ALTER TYPE "public"."staff_role" RENAME VALUE 'admin' TO 'super_admin';--> statement-breakpoint
ALTER TYPE "public"."staff_role" RENAME VALUE 'editor' TO 'admin';--> statement-breakpoint
ALTER TABLE "staff" ALTER COLUMN "role" SET DEFAULT 'admin';
