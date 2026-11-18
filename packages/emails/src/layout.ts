/**
 * Email layout: table-based, inline styles (what email clients actually support),
 * 600px wide, brand green header. Every template's body is wrapped in this.
 */
export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escape, keep the sender's line breaks. */
export const multiline = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

const GREEN = "#015a1a";
const INK = "#1e1e1e";
const MUTED = "#636466";

export type Brand = { orgName: string; siteUrl: string; address?: string | null };

export function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="background:${GREEN};border-radius:8px"><a href="${esc(href)}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-weight:600;text-decoration:none;font-family:Arial,Helvetica,sans-serif">${esc(label)}</a></td></tr></table>`;
}

/** Key/value rows, e.g. lead details. Values are escaped; empty values skipped. */
export function details(rows: [string, string | null | undefined][]) {
  const body = rows
    .filter((r): r is [string, string] => Boolean(r[1]))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:${MUTED};vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:${INK}">${multiline(v)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:15px;line-height:1.5">${body}</table>`;
}

export function layout(brand: Brand, opts: { preheader: string; body: string }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(brand.orgName)}</title></head>
<body style="margin:0;padding:0;background:#f4f6f2">
<div style="display:none;max-height:0;overflow:hidden">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:${GREEN};padding:20px 32px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#ffffff">${esc(brand.orgName)}</td></tr>
<tr><td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:${INK}">${opts.body}</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #e4e7e1;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${MUTED}">${esc(brand.orgName)}${brand.address ? ` · ${esc(brand.address)}` : ""}<br><a href="${esc(brand.siteUrl)}" style="color:${MUTED}">${esc(brand.siteUrl.replace(/^https?:\/\//, ""))}</a></td></tr>
</table></td></tr></table></body></html>`;
}
