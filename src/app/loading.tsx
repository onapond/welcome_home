/**
 * 페이지 데이터를 기다리는 동안의 폴백 화면.
 *
 * Sanity 응답이 느릴 때 빈 화면 대신 로딩 중임을 알린다.
 * 스피너 대신 절제된 텍스트와 얇은 진행 표시만 쓴다.
 */
export default function Loading() {
  return (
    <main
      className="flex flex-col items-center justify-center px-4 py-24"
      style={{ minHeight: "60vh", backgroundColor: "var(--color-bg)" }}
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-5">
        <div
          className="h-0.5 w-32 overflow-hidden rounded-full"
          style={{ backgroundColor: "rgba(43,58,140,0.12)" }}
        >
          <div
            className="h-full w-1/3 rounded-full"
            style={{
              backgroundColor: "var(--color-primary)",
              animation: "chungpa-loading 1.2s ease-in-out infinite",
            }}
          />
        </div>
        <p className="text-sm" style={{ color: "var(--color-dark-soft)" }} role="status">
          불러오는 중입니다
        </p>
      </div>
    </main>
  );
}
