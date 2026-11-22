import { cookies } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { PageTitle } from "@/components/page-title";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { requireStaff } from "@/lib/auth";
import { newEnquiries } from "@/lib/counts";

/**
 * Signed-in shell: collapsible sidebar (icon rail on desktop, drawer on phones)
 * and a top bar. Every page below is staff-only.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const me = await requireStaff();
  const open = (await cookies()).get("sidebar_state")?.value !== "false";
  const { total: unread } = await newEnquiries();
  return (
    <SidebarProvider defaultOpen={open}>
      <AppSidebar
        user={{ name: me.name, email: me.email, role: me.role }}
        badges={{ "/enquiries": unread }}
      />
      <SidebarInset className="bg-muted">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1 [&_svg]:size-4" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <PageTitle />
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
