"use client";
import { usePathname } from "next/navigation";

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const noMainContentStylesPatterns = [
  /^\/$/, // exact match for homepage
  /^\/about(\/.*)?$/, 
  /^\/contact(\/.*)?$/,
  /^\/login(\/.*)?$/,
  /^\/register(\/.*)?$/,
  /^\/forgot-password(\/.*)?$/,
  /^\/reset-password(\/.*)?$/,
  /^\/verify-email(\/.*)?$/
];
  const isDashboardLayout = !noMainContentStylesPatterns.some(pattern => pattern.test(pathname));

  if (!isDashboardLayout) {
    // For special pages like landing, login, etc. that don't use the dashboard layout
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <main className="flex-1 min-h-screen w-full lg:ml-64">
      {/* Adds top padding on mobile to account for the mobile header */}
      <div className="pt-14 lg:pt-0 min-h-screen overflow-y-auto">
        {children}
      </div>
    </main>
  );
};

export default MainWrapper;