---
# 교회 일정 한 건 = 파일 하나. 작성 규칙은 content/README.md.
# 시각은 모두 한국 시간(KST)입니다. 24시간제 HH:MM(00:00~23:59)으로 쓰고, 초나 +09:00 같은 시간대는 붙이지 않습니다.
title: 일정 이름            # 필수
start: 2026-12-24T19:30     # 필수. YYYY-MM-DD(종일) 또는 YYYY-MM-DDTHH:MM
end: 2026-12-24T21:00       # 선택. 시작보다 앞설 수 없습니다
category: 행사              # 예배 · 교육 · 행사 · 선교 · 기타
location: 본당              # 선택
registrationUrl: https://example.com/form   # 선택. 신청 주소(https)
image: events/xmas.webp     # 선택. 사진 경로. 작은 사진이 있으면 { src: events/xmas.webp, thumb: events/xmas-480.webp }
---

선택. 안내 문구(마크다운).
