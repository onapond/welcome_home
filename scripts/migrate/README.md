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
