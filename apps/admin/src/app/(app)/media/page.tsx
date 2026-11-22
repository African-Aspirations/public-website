import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Media" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Media" description="Images used across the site." />
      <ComingSoon
        what="Upload images straight to Cloudinary, with required alt text, and pick them from any editor."
        phase="phase 4"
      />
    </>
  );
}
