import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { requireStaff } from "@/lib/auth";

export const metadata = { title: "Pages" };

export default async function Page() {
  await requireStaff();
  return (
    <>
      <PageHeader title="Pages" description="Every page of the public site and its sections." />
      <ComingSoon
        what="Edit each page's SEO and its sections: reorder, add, remove, and edit them with forms built from the section types."
        phase="phase 5"
      />
    </>
  );
}
