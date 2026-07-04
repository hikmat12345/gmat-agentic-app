"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap } from "lucide-react";

const HIDE_ON: string[] = ["/onboarding", "/quiz", "/tangent", "/micro-lesson"];

export function MobileTopBar() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname.includes(p))) return null;

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-12 items-center justify-between border-b bg-sidebar px-4 md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-bold tracking-tight">Athena</span>
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
