import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Subscribers" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Subscribers" description="Newsletter sign-ups." />
      <ComingSoon
        what="See confirmed, pending and unsubscribed newsletter subscribers and export them as CSV."
        phase="phase 2"
      />
    </>
  );
}
