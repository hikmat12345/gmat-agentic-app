"use client";

import { useState } from "react";
import { useAccountability } from "@/hooks/use-accountability";
import { PracticeLockModal } from "./practice-lock-modal";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AccountabilityProvider({ children }: { children: React.ReactNode }) {
  const { data: userData, loading: userLoading } = useCurrentUser();
  const [dismissed, setDismissed] = useState(false);
  const { locked, missedDate, recommit, recommitting, isLoading } = useAccountability();

  // Only activate after onboarding is complete
  const shouldCheck = !userLoading && userData?.user.onboardingCompleted;

  const handleRecommit = () => {
    recommit(missedDate);
    setDismissed(true);
  };

  const showModal = !!(shouldCheck && !isLoading && locked && !dismissed);

  return (
    <>
      {children}
      <PracticeLockModal
        open={showModal}
        missedDate={missedDate}
        onRecommit={handleRecommit}
        recommitting={recommitting}
      />
    </>
  );
}
