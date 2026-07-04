"use client";

import { getGreeting } from "@/lib/utils";

export function WelcomeHeader({ displayName }: { displayName: string | null; avatarUrl?: string | null }) {
  const name = displayName?.split(" ")[0] || "there";

  return (
    <div className="pb-4 pt-1">
      <p className="text-sm font-medium text-muted-foreground">{getGreeting()}</p>
      <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
    </div>
  );
}
