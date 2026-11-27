---
# 영상 한 건 = 파일 하나 (행사 · 수련회 · 칸타타 영상, 교인 소식 등). 파일 이름이 주소가 됩니다
# (예: 2026-12-24-cantata.md -> /news/videos/2026-12-24-cantata). 작성 규칙은 content/README.md.
title: 영상 제목            # 필수
date: 2026-11-23            # 필수. YYYY-MM-DD
video: https://youtu.be/XXXXXXXXXXX     # 선택. 유튜브 주소(또는 영상 ID 11자) 또는 비메오 주소(https://vimeo.com/숫자). 사진 · 글만 있으면 이 줄을 지웁니다
# thumbnail: videos/2026-11-23/001.webp  # 선택. 목록 카드의 표지 사진. 없으면 유튜브 표지, 그다음 첫 번째 사진
# thumbnail: { src: videos/2026-11-23/001.webp, thumb: videos/2026-11-23/001-480.webp }   # 작은 사진(thumb)이 있으면 이렇게
images:                     # 선택. 본문 아래 사진 (목록 카드 · 사진 칸에는 thumb, 크게 보기에는 src)
  - videos/2026-11-23/001.webp                                        # 경로만 적거나
  - { src: videos/2026-11-23/002.webp, alt: 사진 설명 }                # 사진 설명을 함께 적거나
  - { src: videos/2026-11-23/003.webp, thumb: videos/2026-11-23/003-480.webp, alt: 사진 설명 }   # 작은 사진도 함께
---

선택. 소개 글(마크다운).
