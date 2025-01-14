"use client";

import { usePathname } from "next/navigation";

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  console.log("Pathname in MainWrapper:: " + pathname);

  // Define paths where the `main-content` styles should not apply
  const noMainContentStylesPaths = ["/", "/about/", "/contact/"];

  const mainClass = noMainContentStylesPaths.includes(pathname)
    ? ""
    : "main-content";
  console.log("mainClass:: " + mainClass);

  return <main className={mainClass}>{children}</main>;
};

export default MainWrapper;
