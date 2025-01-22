"use client";
import { usePathname } from "next/navigation";

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const noMainContentStylesPaths = ["/", "/about/", "/contact/", "/login/", "/register/"];
  const isDashboardLayout = !noMainContentStylesPaths.includes(pathname);

  if (!isDashboardLayout) {
    return <main>{children}</main>;
  }

  return (
    <div className="main-content">
      <div className="content-with-sidebar custom-scrollbar">
        {/* Remove the default padding from children */}
        {children}
      </div>
    </div>
  );
};

export default MainWrapper;