import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Partners" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Partners" description="Global partners and their stats." />
      <ComingSoon what="Edit partners, their logos and headline stats." phase="phase 3" />
    </>
  );
}
