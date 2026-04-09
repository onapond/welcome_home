"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudio = pathname.startsWith("/studio");

  return (
    <>
      {!isStudio && <Header />}
      <main className="flex-1">{children}</main>
      {!isStudio && <Footer />}
    </>
  );
}
