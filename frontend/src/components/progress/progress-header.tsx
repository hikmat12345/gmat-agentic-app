"use client";

import { AnimatedSprite } from "@/components/pixel-art/animated-sprite";

export function ProgressHeader() {
  return (
    <div className="flex items-center gap-4">
      <AnimatedSprite
        src="/images/pixel-art/profile-avatar.png"
        alt="Avatar"
        width={64}
        height={64}
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Progress
        </p>
        <h1 className="text-2xl font-bold tracking-tight">GMAT Progress</h1>
        <p className="text-sm text-muted-foreground">
          GMAT Focus Edition &middot; 205–805 scale
        </p>
      </div>
    </div>
  );
}
