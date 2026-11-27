// Plain text → safe pieces of a Markdown line (used by /llms.txt).

/** Collapse line breaks (CR, LF, CRLF, U+2028/2029) and runs of whitespace into one space. */
export function oneLine(text: string): string {
  return text.replace(/[\r\n\u2028\u2029]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Text for `[label](url)`: one line, with `\`, `[`, `]` backslash-escaped so the label cannot close early. */
export function markdownLinkLabel(text: string): string {
  return oneLine(text).replace(/[\\[\]]/g, (ch) => `\\${ch}`);
}
