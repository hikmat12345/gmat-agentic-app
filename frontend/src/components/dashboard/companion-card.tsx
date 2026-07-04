"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function CompanionCard() {
  return (
    <Link href="/mentor">
      <div className="group cursor-pointer border bg-card p-5 transition-colors hover:border-primary/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Need guidance?</p>
            <p className="text-xs text-muted-foreground">
              Talk to your coach
            </p>
          </div>
          <MessageCircle className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </div>
    </Link>
  );
}
