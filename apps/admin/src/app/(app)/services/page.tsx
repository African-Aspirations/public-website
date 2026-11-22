import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Services & FAQs" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Services & FAQs" description="Services and frequently asked questions." />
      <ComingSoon what="Edit services, their features, and the FAQs." phase="phase 3" />
    </>
  );
}
