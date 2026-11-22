"use client";
import { CloudUpload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { publishSite } from "@/lib/actions/publish";
import type { PublishState } from "@/lib/publish";

const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1
    ? "just now"
    : m < 60
      ? `${m} min ago`
      : m < 1440
        ? `${Math.round(m / 60)} h ago`
        : `${Math.round(m / 1440)} d ago`;
};

/** Top-bar Publish: rebuilds the public site with everything saved so far. */
export function PublishButton({
  state,
}: {
  state: Omit<PublishState, "last"> & { last: { at: string; by: string } | null };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const status = state.last
    ? `Last published ${ago(state.last.at)} by ${state.last.by}`
    : "Never published from the admin";
  const label = state.pending ? `Publish (${state.pending})` : "Publish";
  return (
    <div className="ml-auto flex items-center gap-3">
      <span className="hidden text-xs text-muted-foreground md:inline" aria-live="polite">
        {msg ??
          (state.pending
            ? `${state.pending} unpublished change${state.pending === 1 ? "" : "s"}`
            : status)}
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              size="sm"
              variant={state.pending ? "default" : "outline"}
              disabled={!state.configured || pending}
              onClick={() =>
                start(async () => {
                  if (
                    !confirm(
                      "Publish now? The public site rebuilds with every saved change (takes 1–2 minutes).",
                    )
                  )
                    return;
                  const r = await publishSite();
                  setMsg(r.error ?? "Publishing… the site updates in 1–2 minutes.");
                  router.refresh();
                })
              }
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CloudUpload className="size-4" />
              )}
              {label}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {state.configured ? status : "Set VERCEL_DEPLOY_HOOK_URL to enable publishing"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
