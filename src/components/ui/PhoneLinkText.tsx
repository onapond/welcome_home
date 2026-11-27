/**
 * 문구 안의 교회 전화번호를 눌러서 걸 수 있는 링크로 바꿔 보여 준다.
 * (오류 문구처럼 서버가 보낸 글에 번호가 섞여 있을 때 쓴다.)
 */
export default function PhoneLinkText({
  text,
  phone,
  phoneHref,
}: {
  text: string;
  phone: string;
  phoneHref: string;
}) {
  const parts = text.split(phone);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && (
            <a href={phoneHref} className="font-semibold underline underline-offset-2">
              {phone}
            </a>
          )}
          {part}
        </span>
      ))}
    </>
  );
}
