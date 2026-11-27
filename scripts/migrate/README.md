# convert.py — old boards → content/ (migration m2)

Stdlib Python, run with `-I`. Reads `<crawl>/boards/*.json`, `<crawl>/media/manifest.json`,
`<crawl>/binaries.json`; writes `<out>` (a content folder) and bulletin PDFs under `<public>/bulletins/`.

```bash
# review copy (any empty folder)
python3 -I scripts/migrate/convert.py --crawl ../chungpa21-crawl --out /tmp/conv/content
# into the repo, replacing the sample files
python3 -I scripts/migrate/convert.py --crawl ../chungpa21-crawl --out content --replace
npm run check:content
```

Options: `--public DIR` (default `<out>/../public`), `--report FILE` (default `<crawl>/convert-report.md`,
outside the repo), `--replace` (delete `.md` files other than `_…` templates and bulletin PDFs that this
run does not write — the samples), `--no-download`, `--delay 0.5`.

- Mapping = `docs/migration-plan.md`. `s_board_2` / `s_board_4` are never read.
  sermons ← media_1 (주일예배) + media_2 (금요기도회): scripture = `chapter`, preacher = `author`,
  falling back to the `▶ 설교자 / 성경본문 / 설교제목` lines (those lines are dropped from the body).
  praise ← media_3 (no body). videos ← s_board_3. albums ← s_board_1 (category from title words,
  else 기타; photos = manifest `key` + `thumbKey` + width/height). events ← s_board_5 (start/end from
  the `YY-MM-DD[~MM-DD]` title prefix, or `M월 D일` + post year; prefix removed from the title).
  news ← s_board_6 (`category: 소식`, date from the `YY-MM-DD` title prefix when present).
  bulletins ← weekly (`pdf: /bulletins/<id>.pdf`, file in `public/bulletins/`). history.yaml, staff.yaml.
- Video: only YouTube goes into `video:` (first one; more become `[영상 N](https://youtu.be/…)` links).
  Vimeo links are dropped (docs/검토규칙.md ⑱). A videos post without YouTube gets its first photo as `thumbnail`.
- Photos: only manifest entries with `status: ok`. `sameFileAs` is NOT used (picked by file-name tail,
  may be a different photo); failed photos are left out and listed under 「사진 없음」 in the report.
- Ids: `YYYY-MM-DD`, same day → `-2`, `-3` … in (date, board, seq) order. Same input → identical files
  (files whose content is unchanged are not rewritten).
- Every collection item has `legacy: {board, seq, url}`; weekly has no post number, so `seq` is the
  first 10 hex of SHA-1(PDF URL). history / staff schemas have no `legacy` field.
- Body HTML → Markdown: paragraphs, `<br>` (as `\` line ends), links (old-site relative links made
  absolute), bold, images (`![title](manifest key)`), table rows as `칸 · 칸` lines; scripts, styles,
  iframes and other tags removed; entities decoded; Markdown characters and `{{ }}` escaped.
- Privacy: author IP / id never written; phone-like numbers masked `010-****-****` (not the church's
  02-714-0041~3 / 02-711-8166); e-mails masked except church@chungpa21.org; staff phones/e-mails omitted.
  Personal names are kept as-is (user decision 2026-11-27); the report still counts them per board.
- Home addresses (user decision 2026-11-27) become `(주소 생략)`: a 시/군/구/읍/면 word + road
  (`…로/…길` + number) or lot (`…동/리/가` + number) + optional building / `N동 N호`, a bare `N동 N호`,
  and a district-only address right after 「이사」. Kept: the church's own (청파로 · 서계동) and event
  venues (a venue word — `…교회`, 홀, 웨딩, 회관, 캠핑장, 수양관 … — within 60 chars before, nearer than
  「이사」). No cue either way → removed and listed as 「판단 불확실」. The report lists each removal by
  file + legacy board/seq + kind (never the address text).
- Bulletin PDFs are scanned images (no text layer). An OCR pass (tesseract `kor`) found a home address
  or personal mobile numbers in 23 of them; `PDF_HOLD` keeps those PDFs out of the repo (entry written
  without `pdf:`, listed under 「주보 PDF 보류」) until a redacted copy exists. OCR can miss things.
- 주민등록번호 / 16-digit card-like numbers are masked if present. The report's 「남은 민감 정보 검사」
  counts (without changing anything) account-like numbers, car plates, leftover phones / e-mails / IPv4
  and address shapes still in the output, with file names.
- PDFs: downloaded once into `<crawl>/weekly-pdf/` (`state.json`, resumable, one connection,
  `crawl.Fetcher`, `%PDF-` check, size compared with `binaries.json`), then copied.

# chungpa21.org inventory crawler

Re-runnable, stdlib-only (Python 3) crawler that inventories the old WebChurch site
(http://www.chungpa21.org/): metadata, body text and file URLs only. It never downloads
photos/PDFs/videos (only `HEAD` or a 1-byte / 64 KB `Range` probe for size and pixel dimensions).

## Run

```bash
cd scripts/migrate
python3 crawl.py                      # all stages: crawl, binaries, dims, report
python3 crawl.py crawl                # only walk the boards
python3 crawl.py binaries dims report # later stages
python3 crawl.py report               # regenerate inventory.md from the JSON
```

Options: `--out DIR` (default `/Users/shin/Developer/chungpa21-crawl`), `--delay 0.4`,
`--refresh-lists` (re-fetch list/ajax pages; detail pages stay cached), `--dims-sample 40`,
`--weekly-from 2012`.

Polite by design: one connection, 0.4 s (+jitter) between requests, retries with backoff,
resumable. Every fetched page is cached gzip'd in `<out>/cache/pages/`; delete a file there (or
the whole dir) to force a re-fetch. HEAD results are cached in `binaries.json`.

## Site rules derived from `link_manager.js` `goTo()`

| menu | URL |
|---|---|
| media_board (설교/찬양) | `/modu/media_board/list.asp?board_idx=N&page=P`, detail `read.asp?board_idx=N&sub_idx=S&seq=Q` |
| s_board (앨범/영상/기도/일정/소식) | `/modu/s_board/list.asp?board_seq=N&page=P`, detail `read.asp?board_seq=N&board_sub_seq=S&view_sub_seq=V&seq=Q` |
| uotc (static pages) | `/modu/document/document_view.asp?uotc_code=A&uotc=B` |
| serve (staff) | `/modu/info/steward/steward_prepare.asp?sub=serve&seq=1` (302 to `steward_main.asp`) |
| history | POST `/modu/history/ajax_history_main_list.asp` |
| weekly (주보) | POST `/modu/weekly/ajax_weekly_V2_cate.asp` with `vget=5&cate=1&y=&m=&w=` |

The site needs the `com` cookie (its value contains `&` and `=`, which `http.cookiejar` drops),
so `Fetcher` parses `Set-Cookie` by hand and sends a raw `Cookie` header. Without it the
history/weekly ajax endpoints answer 500.

## Output (`<out>/`)

- `boards/<key>.json` one file per board (`media_1..3`, `s_board_1..6`, `weekly`, `history`, `staff`);
  each item has `title_raw`, `date`, `author`, `detail_url`, `body_text`, `body_html`,
  `body_fields` (`▶ 설교자 : ...` lines, raw), `images`, `attachments`, `videos` (host + id).
- `pages.json` home page, static document pages, probed WebChurch modules, menu map.
- `binaries.json` per binary URL: HTTP status, size, content-type, last-modified.
- `image_dims_sample.json` pixel sizes of a sample of album photos.
- `failures.json`, `inventory.md` (the summary), `notes.md` (hand-written, appended to the report if present).

Private data (staff phone/e-mail, author IPs) is kept in the JSON but flagged in `inventory.md`.

# photos.py — download + resize the old photos (migration m3)

Stdlib Python + `resize.mjs` (node, the repo's existing `sharp`; no new deps). Everything is
written OUTSIDE the repo under `<out>/media/`; downloaded files are untrusted data, so run with `-I`.

```bash
python3 -I scripts/migrate/photos.py                    # plan download resize manifest verify
python3 -I scripts/migrate/photos.py download           # resumable; re-run to retry failures
python3 -I scripts/migrate/photos.py manifest verify    # rebuild manifest, re-check all outputs
python3 -I scripts/migrate/photos.py manifest prune verify  # delete stale files in media/out, then check
```

Options: `--out DIR` (made absolute at start; refused if it, or any write target after resolving
symlinks, is inside this git checkout — exit 2), `--workers 4` (max 4 connections), `--delay 0.3`
(per connection), `--force-resize`, `--verify-n 10`, `--seed N`.

Exit codes: 0 ok · 1 `verify` found problems (summary is written first) · 2 refused (output inside
the repo, `prune` with a stale manifest). Download / resize failures do not change the exit code:
they are listed in `manifest.json` `failures` and only `status: ok` keys are ever uploaded.

- Scope: photos (`images` + photo attachments) of `media_1..3`, `s_board_1/3/5/6`, `history`, `staff`.
  `s_board_2` (새가족소개) and `s_board_4` (중보기도) are not migrated: a URL used only there is skipped.
  PDFs (weekly) are not handled here. Photo = `view_img.asp`, or a file name ending in a photo
  extension — for `view_img.asp` / `download.asp` links the name is the `filename=` value, so a
  `download.asp?filename=x.jpg` attachment counts; the downloaded bytes are still sniffed.
- Download: one `crawl.Fetcher` per worker (same lessons: fresh connection every 60 requests,
  reconnect on HTTP 400, retries with backoff). Anything that is not HTTP 200 + image magic bytes is
  recorded as a failure. Resume is bound to identity: `state/downloads.json` keeps URL, key, file and
  sha256; a file on disk is reused only if the current plan maps that URL to that same file, no other
  URL claims it, and it still hashes the same. Otherwise the original and both outputs at that key
  are deleted and the URL is fetched again.
- Key: `<collection>/<board_key>-<seq>/<nnn>.webp`, nnn = position of the photo in its item
  (e.g. `albums/s_board_1-917/003.webp`, thumb `albums/s_board_1-917/003-480.webp`). Collections:
  sermons (media_1, media_2), praise, videos (s_board_3), albums (s_board_1), events, news, history, staff.
  A URL used by several items gets one key (first item in that board order) and all references.
- Resize: EXIF orientation applied, then all metadata dropped (EXIF/GPS/XMP/IPTC/ICC); main long edge
  <= 1600 px, thumb <= 480 px, webp q80, never upscaled. Animated GIFs keep the first frame only.
  A resize result records the sha256 of the bytes it was made from and is reused only while that equals
  the download's sha256 (results from before this rule are redone once). A failed resize removes both outputs.
- Output: `media/original/<key stem>.<ext>`, `media/out/<key>`, `media/manifest.json`
  (URL -> key, thumbKey, width, height, bytes, sha256, references, status + `failures`),
  `media/state/` (resume state, `verify-summary.json`).
  - `sameFileAs` (on a failed download): another URL of the SAME item has exactly the same file name
    (e.g. `view_img.asp?filename=X` vs `/file/.../X`), and every such candidate is `ok` with one sha256.
    Candidates are the `/file/` paths of that name (a failed one keeps it unresolved) plus asp aliases
    (`view_img` / `download.asp`) of that name that downloaded; a failed alias is not another file.
    Otherwise the failure stays unresolved, with `sameFileCandidates` for a manual check.
  - `sameContentAs` (on an ok entry): byte-identical (sha256) to an earlier ok key.
- `verify` reads every output with sharp: webp, no metadata, long edge = min(original, limit),
  orientation kept, original sha256 = manifest; checks the manifest still matches plan + state; and
  lists every file in `media/out/` that is not an ok key/thumbKey of the manifest (e.g. a photo now only
  in an excluded board) as a problem — `prune` deletes those. Prints a random sample (always including
  EXIF-rotated photos if any).
- Upload (m4) must take the file list from the manifest (`status: ok` → `key` + `thumbKey`), never
  "everything under `media/out/`", and only after `verify` exits 0.
