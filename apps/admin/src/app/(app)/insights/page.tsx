import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Insights" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Insights" description="Media & Insights posts." />
      <ComingSoon what="Write and publish Insights posts." phase="phase 6" />
    </>
  );
}
