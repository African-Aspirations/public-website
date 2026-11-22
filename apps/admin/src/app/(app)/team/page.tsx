import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Team" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Team" description="Leadership shown on the About page." />
      <ComingSoon what="Edit team members: photo, role, credentials and bio." phase="phase 3" />
    </>
  );
}
