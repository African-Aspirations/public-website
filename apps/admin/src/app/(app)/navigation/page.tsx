import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Navigation" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Navigation" description="Header and footer menus." />
      <ComingSoon
        what="Edit the header and footer menus: labels, order, groups and links."
        phase="phase 3"
      />
    </>
  );
}
