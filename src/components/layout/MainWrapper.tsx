"use client";

import { usePathname } from "next/navigation";

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Define paths where the `main-content` styles should not apply
  const noMainContentStylesPaths = ["/"];

  const mainClass = noMainContentStylesPaths.includes(pathname)
    ? ""
    : "main-content";

  return <main className={mainClass}>{children}</main>;
};

export default MainWrapper;
