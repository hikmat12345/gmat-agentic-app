"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

const FULLSCREEN_ON = ["/micro-lesson"];

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const pathname = usePathname();
  const isFullscreen = FULLSCREEN_ON.some((p) => pathname.includes(p));

  if (isFullscreen) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <main
      className={cn(
        "min-h-screen pb-16 pt-12 transition-[margin] duration-200 ease-in-out md:pb-0 md:pt-0",
        collapsed ? "md:ml-16" : "md:ml-56"
      )}
    >
      {children}
    </main>
  );
}
