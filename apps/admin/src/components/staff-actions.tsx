"use client";
import { MoreHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resendInvite, resetStaffMfa, setStaffDisabled, setStaffRole } from "@/lib/actions/staff";
import type { FormState } from "@/lib/form-data";
import type { StaffRole } from "@/lib/session";

/** Per-user menu on Settings → Users (super admins). */
export function StaffActions({
  uid,
  name,
  role,
  disabled,
  hasMfa,
}: {
  uid: string;
  name: string;
  role: StaffRole;
  disabled: boolean;
  hasMfa: boolean;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<FormState | null>(null);
  const run = (fn: () => Promise<FormState>, ask?: string) => {
    if (ask && !confirm(ask)) return;
    start(async () => setResult(await fn()));
  };
  return (
    <div className="grid justify-items-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={pending}
            aria-label={`Actions for ${name}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {role === "admin" ? (
            <DropdownMenuItem
              onSelect={() =>
                run(
                  () => setStaffRole(uid, "super_admin"),
                  `Make ${name} a super admin? They'll be able to manage users.`,
                )
              }
            >
              Make super admin
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() =>
                run(() => setStaffRole(uid, "admin"), `Make ${name} an admin (no user management)?`)
              }
            >
              Make admin
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => run(() => resendInvite(uid))}>
            Send invite again
          </DropdownMenuItem>
          {hasMfa && (
            <DropdownMenuItem
              onSelect={() =>
                run(
                  () => resetStaffMfa(uid),
                  `Remove ${name}'s authenticator app (e.g. lost phone)?`,
                )
              }
            >
              Reset authenticator
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {disabled ? (
            <DropdownMenuItem onSelect={() => run(() => setStaffDisabled(uid, false))}>
              Allow sign-in again
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() =>
                run(
                  () => setStaffDisabled(uid, true),
                  `Remove ${name}'s access? They're signed out everywhere immediately.`,
                )
              }
            >
              Remove access
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {result && (result.error || result.message) && (
        <Alert variant={result.error ? "destructive" : "success"} className="max-w-sm text-left">
          {result.error ?? result.message}
          {result.link && (
            <input
              readOnly
              value={result.link}
              onFocus={(e) => e.target.select()}
              className="mt-2 w-full rounded border bg-background px-2 py-1 font-mono text-xs"
            />
          )}
        </Alert>
      )}
    </div>
  );
}
