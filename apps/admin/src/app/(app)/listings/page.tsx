import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Listings" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Listings" description="Businesses for sale on the public site." />
      <ComingSoon
        what="Add, edit and publish listings with their photo gallery, price, category and status."
        phase="phase 6"
      />
    </>
  );
}
