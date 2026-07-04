"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import { useSidebar } from "./sidebar-context";
import { useSubscription } from "@/hooks/use-subscription";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Trophy,
  BarChart2,
  MessageSquare,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  CreditCard,
  ShieldCheck,
  Lock,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/learning", label: "Study Plan", icon: BookOpen },
  { href: "/full-gmat", label: "Exam", icon: ClipboardCheck, premium: true },
  { href: "/profile", label: "Achievements", icon: Trophy },
  { href: "/queue", label: "My Progress", icon: BarChart2 },
  { href: "/mentor", label: "Mentor", icon: MessageSquare, premium: true },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

const HIDE_ON: string[] = ["/onboarding", "/quiz", "/tangent", "/micro-lesson"];

function useHideSidebar() {
  const pathname = usePathname();
  return HIDE_ON.some((prefix) => pathname.includes(prefix));
}

function NavTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div
        className={cn(
          "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2",
          "whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5",
          "text-xs font-medium text-popover-foreground shadow-md",
          "opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100"
        )}
      >
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-popover" />
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const hidden = useHideSidebar();
  const { collapsed, toggle } = useSidebar();
  const { isPremium } = useSubscription();

  if (hidden) return null;

  const iconBtn = cn(
    "flex items-center justify-center rounded-lg transition-colors",
    "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground"
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r bg-sidebar md:flex",
        "transition-[width] duration-200 ease-in-out",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo header */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b",
          collapsed ? "justify-center" : "gap-2 px-4"
        )}
      >
        <Link
          href="/dashboard"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          title="Dashboard"
        >
          <GraduationCap className="h-4 w-4" />
        </Link>
        {!collapsed && (
          <span className="flex-1 text-base font-bold tracking-tight">Athena</span>
        )}
      </div>

      {/* Primary nav */}
      <nav
        className={cn(
          "flex flex-1 flex-col gap-0.5 overflow-y-auto py-3",
          collapsed ? "items-center px-1.5" : "px-2"
        )}
      >
        {/* Collapse / expand toggle at top of nav */}
        {collapsed ? (
          <NavTooltip label="Expand sidebar">
            <button
              onClick={toggle}
              className={cn(iconBtn, "mb-1 h-10 w-10")}
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </NavTooltip>
        ) : (
          <button
            onClick={toggle}
            className={cn(
              iconBtn,
              "mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium"
            )}
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
            <span>Collapse</span>
          </button>
        )}

        {/* Divider */}
        <div className="my-1 h-px w-full bg-border/40" />

        {/* Nav items */}
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const locked = item.premium && !isPremium;

          const linkEl = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center rounded-lg transition-colors",
                collapsed
                  ? "h-10 w-10 justify-center"
                  : "w-full gap-3 px-3 py-2.5 text-sm font-medium",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {locked && (
                    <Lock className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                  )}
                </>
              )}
              {collapsed && locked && (
                <Lock className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-muted-foreground/70" />
              )}
            </Link>
          );

          return collapsed ? (
            <NavTooltip key={item.href} label={locked ? `${item.label} (Premium)` : item.label}>
              {linkEl}
            </NavTooltip>
          ) : (
            linkEl
          );
        })}
      </nav>

      {/* Bottom: theme toggle + user avatar */}
      <div
        className={cn(
          "shrink-0 border-t py-3",
          collapsed
            ? "flex flex-col items-center gap-2 px-0"
            : "flex items-center justify-between px-4"
        )}
      >
        <ThemeToggle />
        <UserButton />
      </div>
    </aside>
  );
}
