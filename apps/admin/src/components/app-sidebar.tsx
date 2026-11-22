"use client";
import { ChevronRight, ChevronsUpDown, FolderOpen, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/actions";
import { CONTENT, INBOX, isActive, type NavItem, SETTINGS, TOP } from "@/lib/nav";
import type { StaffRole } from "@/lib/session";
import logo from "../../public/logo.webp";
import logoMark from "../../public/logo-mark.webp";

const ROLE_LABEL: Record<StaffRole, string> = { super_admin: "Super admin", admin: "Admin" };

function Item({ item, path, badge }: { item: NavItem; path: string; badge?: number }) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive(path, item.href)} tooltip={item.label}>
        <Link href={item.href} onClick={() => setOpenMobile(false)}>
          <item.icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
      {!!badge && (
        <SidebarMenuBadge className="bg-primary text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-[active=true]/menu-button:text-primary-foreground">
          {badge > 99 ? "99+" : badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

/** Content: an inline collapsible when the sidebar is open, a flyout menu in icon mode. */
function ContentGroup({ path }: { path: string }) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const inside = CONTENT.some((i) => isActive(path, i.href));

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton isActive={inside} tooltip="Content">
              <FolderOpen />
              <span>Content</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-48">
            <DropdownMenuLabel>Content</DropdownMenuLabel>
            {CONTENT.map((i) => (
              <DropdownMenuItem key={i.href} asChild>
                <Link href={i.href}>
                  <i.icon />
                  {i.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild defaultOpen={inside} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip="Content">
            <FolderOpen />
            <span>Content</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {CONTENT.map((i) => (
              <SidebarMenuSubItem key={i.href}>
                <SidebarMenuSubButton asChild isActive={isActive(path, i.href)}>
                  <Link href={i.href} onClick={() => setOpenMobile(false)}>
                    {i.label}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function UserMenu({ name, email, role }: { name: string | null; email: string; role: StaffRole }) {
  const { isMobile } = useSidebar();
  const display = name ?? email;
  const initials =
    display
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?";
  const avatar = (
    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
      {initials}
    </span>
  );
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={display}
              className="data-[state=open]:bg-sidebar-accent"
            >
              {avatar}
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">{display}</span>
                <span className="truncate text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
              </span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" className="min-w-56">
            <DropdownMenuLabel className="font-normal">
              <span className="block truncate font-medium">{display}</span>
              <span className="block truncate text-xs text-muted-foreground">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={SETTINGS.href}>
                <SETTINGS.icon />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => signOut()}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({
  user,
  badges = {},
}: {
  user: { name: string | null; email: string; role: StaffRole };
  /** Counts shown next to nav items, keyed by href (e.g. new enquiries). */
  badges?: Record<string, number>;
}) {
  const path = usePathname();
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-4 group-data-[collapsible=icon]:px-2">
        <Link href="/" aria-label="Overview" className="flex items-center">
          <Image
            src={logo}
            alt="African Aspirations"
            priority
            className="h-11 w-auto group-data-[collapsible=icon]:hidden dark:brightness-0 dark:invert"
          />
          <Image
            src={logoMark}
            alt="African Aspirations"
            className="hidden h-8 w-auto group-data-[collapsible=icon]:block dark:brightness-0 dark:invert"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {TOP.map((i) => (
              <Item key={i.href} item={i} path={path} />
            ))}
            <ContentGroup path={path} />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Inbox</SidebarGroupLabel>
          <SidebarMenu>
            {INBOX.map((i) => (
              <Item key={i.href} item={i} path={path} badge={badges[i.href]} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <Item item={SETTINGS} path={path} />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu {...user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
