"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  BarChart2,
  MessageSquare,
} from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/learning", label: "Study", icon: BookOpen },
  { href: "/full-gmat", label: "Exam", icon: ClipboardCheck },
  { href: "/queue", label: "Progress", icon: BarChart2 },
  { href: "/mentor", label: "Mentor", icon: MessageSquare },
];

const HIDE_ON: string[] = ["/onboarding", "/quiz", "/tangent", "/micro-lesson"];

export function MobileTabBar() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname.includes(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-stretch border-t bg-sidebar md:hidden">
      {tabs.map((tab) => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <tab.icon className={cn("h-5 w-5", isActive && "text-primary")} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
