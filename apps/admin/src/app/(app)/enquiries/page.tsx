import { ComingSoon } from "@/components/coming-soon";
import { PageHeader } from "@/components/page-header";
import { UrlTabs } from "@/components/url-tabs";
import { requireStaff } from "@/lib/auth";
import { newEnquiries } from "@/lib/counts";

export const metadata = { title: "Enquiries" };

export default async function Enquiries({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireStaff();
  const tab = (await searchParams).tab === "contact" ? "contact" : "listings";
  const c = await newEnquiries();
  return (
    <>
      <PageHeader
        title="Enquiries"
        description="People who reached out from a listing or the contact page. They already get an automatic reply by email."
      />
      <UrlTabs
        base="/enquiries"
        current={tab}
        tabs={[
          { id: "listings", label: "Listings", badge: c.listings },
          { id: "contact", label: "Contact", badge: c.contact },
        ]}
      />
      {tab === "listings" ? (
        <ComingSoon
          what={`${c.listings} new listing enquiries. Next: read each enquiry with its listing, reply by email, and mark it contacted or closed.`}
          phase="phase 2"
        />
      ) : (
        <ComingSoon
          what={`${c.contact} new contact-form messages. Next: read, reply by email, and mark them contacted or closed.`}
          phase="phase 2"
        />
      )}
    </>
  );
}
