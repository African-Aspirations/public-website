import { buttonVariants, cn } from "@aa/ui/recipes";
import { ArrowLeft, ExternalLink, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireStaff } from "@/lib/auth";
import { getEnquiry, isKind, STATUSES } from "@/lib/enquiries";
import { updateEnquiryStatus } from "@/lib/enquiry-actions";
import { env } from "@/lib/env";
import { formatDateTime } from "@/lib/format";

export const metadata = { title: "Enquiry" };

const NEXT_LABEL = { new: "Mark as new", contacted: "Mark contacted", closed: "Close" } as const;

export default async function EnquiryPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  await requireStaff();
  const { kind, id } = await params;
  if (!isKind(kind)) notFound();
  const e = await getEnquiry(kind, id);
  if (!e) notFound();

  const back = kind === "contact" ? "/enquiries?tab=contact" : "/enquiries";
  const subject = e.listing
    ? `Re: your enquiry about ${e.listing.name}`
    : "Re: your message to African Aspirations";
  const quoted = e.message
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const mailto = `mailto:${encodeURIComponent(e.name)}%20%3C${e.email}%3E?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi ${e.name.split(" ")[0]},\n\n\n\n---\n${quoted}`)}`;

  return (
    <div className="grid max-w-3xl gap-6">
      <Link
        href={back}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {kind === "contact" ? "Contact messages" : "Listing enquiries"}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{e.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Received {formatDateTime(e.createdAt)}
            {e.status !== "new" && ` · updated ${formatDateTime(e.updatedAt)}`}
          </p>
        </div>
        <StatusBadge status={e.status} className="text-sm" />
      </header>

      <Card className="gap-4">
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="text-muted-foreground">Email</dt>
            <dd>
              <a
                href={`mailto:${e.email}`}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="size-4" aria-hidden />
                {e.email}
              </a>
            </dd>
            {e.phone && (
              <>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>
                  <a
                    href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="size-4" aria-hidden />
                    {e.phone}
                  </a>
                </dd>
              </>
            )}
            {e.company && (
              <>
                <dt className="text-muted-foreground">Company</dt>
                <dd>{e.company}</dd>
              </>
            )}
            {e.topic && (
              <>
                <dt className="text-muted-foreground">Topic</dt>
                <dd>{e.topic}</dd>
              </>
            )}
            {kind === "listing" && (
              <>
                <dt className="text-muted-foreground">Listing</dt>
                <dd>
                  {e.listing ? (
                    <a
                      href={`${env().SITE_URL}/listings/${e.listing.slug}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      {e.listing.name}
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Listing deleted</span>
                  )}
                </dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      <section aria-labelledby="msg">
        <h2 id="msg" className="mb-2 text-sm font-medium text-muted-foreground">
          Message
        </h2>
        <div className="rounded-xl border bg-background p-5 text-sm leading-relaxed whitespace-pre-wrap">
          {e.message}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <a href={mailto} className={cn(buttonVariants())}>
          <Mail className="size-4" aria-hidden />
          Reply by email
        </a>
        {STATUSES.filter((s) => s !== e.status).map((s) => (
          <form key={s} action={updateEnquiryStatus.bind(null, kind, e.id, s)}>
            <Button variant="outline">{NEXT_LABEL[s]}</Button>
          </form>
        ))}
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        Replying opens your email app. Mark it contacted once you&apos;ve replied.
      </p>
    </div>
  );
}
