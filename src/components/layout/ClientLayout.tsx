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
      {/*
        각 페이지가 자체적으로 <main>을 렌더하므로 여기서는 레이아웃용
        래퍼만 둔다. <main>을 중첩하면 문서에 main이 둘이 되어
        유효하지 않은 HTML이 되고 스크린리더의 본문 탐색도 어긋난다.
      */}
      <div className="flex-1">{children}</div>
      {!isStudio && <Footer />}
    </>
  );
}
