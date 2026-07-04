import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { MainContent } from "@/components/layout/main-content";
import { AccountabilityProvider } from "@/components/accountability/accountability-provider";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop left sidebar */}
        <Sidebar />

        {/* Mobile header (logo + user) */}
        <MobileTopBar />

        {/* Main content — offset by sidebar width (dynamic) on md+, top bar on mobile */}
        <MainContent>
          <AccountabilityProvider>
            {children}
          </AccountabilityProvider>
        </MainContent>

        {/* Mobile bottom tab bar */}
        <MobileTabBar />
      </div>
    </SidebarProvider>
  );
}
