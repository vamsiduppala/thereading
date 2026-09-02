// The primitives the report is built from: a self-contained HTML shell and a handful of
// block builders.
//
// Two constraints shape all of it. It must survive being saved to disk and opened later with
// no network — so every style is inline and no asset is fetched. And it must PRINT, because a
// document this long is read on paper or not at all — so the page rules, the break-avoidance
// and the table repeat-headers are not decoration, they are the difference between a reference
// and 200 pages of confetti.
//
// Everything here escapes by default. The report interpolates a person's own birthplace and
// name into the page, and those are the two fields most likely to contain an apostrophe, an
// ampersand, or something worse.

export const esc = (s: unknown): string => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export interface Block { html: string }

let sectionCounter = 0;
export function resetCounter(): void { sectionCounter = 0; }

export interface SectionSpec {
  id: string;
  title: string;
  /** One or two sentences under the heading, telling the reader what they are looking at. */
  intro?: string;
  body: string;
  /** Start this section on a fresh printed page. */
  pageBreak?: boolean;
}

const toc: { id: string; title: string; n: number }[] = [];
export function resetToc(): void { toc.length = 0; }
export function tocEntries(): typeof toc { return toc; }

export function section(spec: SectionSpec): string {
  sectionCounter += 1;
  const n = sectionCounter;
  toc.push({ id: spec.id, title: spec.title, n });
  return `<section class="sec${spec.pageBreak === false ? '' : ' brk'}" id="${esc(spec.id)}">
  <h2><span class="secno">${n}</span>${esc(spec.title)}</h2>
  ${spec.intro ? `<p class="intro">${spec.intro}</p>` : ''}
  ${spec.body}
</section>`;
}

export function sub(title: string, body: string, id?: string): string {
  return `<div class="sub"${id ? ` id="${esc(id)}"` : ''}><h3>${esc(title)}</h3>${body}</div>`;
}

/**
 * A table. `rows` are already-escaped cells — callers escape, because many cells are
 * deliberately marked up (a strength bar, a flag) and blanket-escaping here would kill them.
 */
export function table(headers: string[], rows: string[][], cls = ''): string {
  if (rows.length === 0) return note('Nothing to show here for this chart.');
  return `<div class="tw"><table class="${cls}">
<thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
</table></div>`;
}

/** Key/value pairs — the shape most of the natal facts take. */
export function facts(pairs: [string, string][]): string {
  return `<dl class="facts">${pairs
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;
}

export const p = (s: string): string => `<p>${s}</p>`;
export const note = (s: string): string => `<p class="note">${s}</p>`;

/**
 * A withheld block. Used wherever the corpus refuses rather than lacks — the distinction the
 * whole project rests on, and one a reader cannot make unless it is drawn on the page.
 */
export const withheld = (title: string, why: string): string =>
  `<div class="withheld"><strong>${esc(title)}</strong><p>${esc(why)}</p></div>`;

/** A 0..100 figure with a bar. The number is the fact; the bar is only for scanning. */
export function score(pct: number, label = ''): string {
  const v = Math.max(0, Math.min(100, pct));
  const tone = v >= 66 ? 'hi' : v >= 40 ? 'mid' : 'lo';
  return `<span class="sc ${tone}"><span class="bar"><i style="width:${v.toFixed(1)}%"></i></span>`
    + `<b>${v.toFixed(1)}</b>${label ? `<em>${esc(label)}</em>` : ''}</span>`;
}

export const chip = (s: string, tone = ''): string =>
  `<span class="chip ${tone}">${esc(s)}</span>`;

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export const dmy = (d: Date): string =>
  `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const dmyShort = (d: Date): string =>
  `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]!.slice(0, 3)} ${d.getUTCFullYear()}`;
export const my = (d: Date): string =>
  `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
export const hm = (d: Date): string =>
  `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;

/** 23°14′08″ — degrees within a sign, which is how every classical rule reads a position. */
export function dms(deg: number): string {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  const mm = s === 60 ? m + 1 : m;
  const ss = s === 60 ? 0 : s;
  return `${d}°${String(mm).padStart(2, '0')}′${String(ss).padStart(2, '0')}″`;
}

export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

// ─────────────────────────────────────────────────────────────────────────────
// The document
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
:root{
  --ink:#171512; --dim:#5d574e; --faint:#8b8378; --rule:#ded7ca; --hair:#eee9e0;
  --bg:#fbf9f5; --card:#fff; --accent:#8a5a2b; --hi:#3f6b47; --mid:#8a6a2b; --lo:#8c4a3f;
  --wash:#f4efe4;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:16px/1.62 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;
  -webkit-text-size-adjust:100%}
.wrap{max-width:60rem;margin:0 auto;padding:2.5rem 1.5rem 6rem}
h1,h2,h3,h4{line-height:1.22;font-weight:600;margin:0}
h1{font-size:2.6rem;letter-spacing:-.02em}
h2{font-size:1.68rem;margin:0 0 .5rem;padding-bottom:.45rem;border-bottom:2px solid var(--ink);
  display:flex;align-items:baseline;gap:.6rem}
h3{font-size:1.12rem;margin:1.9rem 0 .6rem;color:var(--accent);
  font-variant-caps:all-small-caps;letter-spacing:.06em}
h4{font-size:1rem;margin:1.2rem 0 .35rem}
.secno{font-size:.82rem;color:var(--faint);font-variant-numeric:tabular-nums;
  border:1px solid var(--rule);border-radius:.28rem;padding:.05rem .38rem;flex:none}
p{margin:.7rem 0}
.intro{color:var(--dim);font-size:1.02rem;margin:.2rem 0 1.1rem}
.note{color:var(--dim);font-size:.92rem;border-left:2px solid var(--rule);padding-left:.85rem}
.sec{margin:0 0 3.2rem}
.sub{margin:0 0 1.4rem}

/* cover */
.cover{text-align:center;padding:3rem 0 2.4rem;border-bottom:1px solid var(--rule);
  margin-bottom:2.4rem}
.cover .who{font-size:1.5rem;margin:.8rem 0 .2rem}
.cover .when{color:var(--dim)}
.cover .stamp{margin-top:1.6rem;font-size:.82rem;color:var(--faint);
  font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace}

/* toc */
.toc{background:var(--card);border:1px solid var(--rule);border-radius:.5rem;
  padding:1.1rem 1.4rem;margin:0 0 3rem;columns:2;column-gap:2.4rem}
.toc a{display:block;color:var(--ink);text-decoration:none;padding:.16rem 0;
  font-size:.94rem;break-inside:avoid}
.toc a:hover{color:var(--accent)}
.toc a b{color:var(--faint);font-variant-numeric:tabular-nums;margin-right:.5rem;
  font-weight:400;font-size:.84rem}

/* tables */
.tw{overflow-x:auto;margin:.7rem 0 1rem}
table{border-collapse:collapse;width:100%;font-size:.9rem}
th{text-align:left;font-weight:600;font-size:.76rem;letter-spacing:.05em;
  text-transform:uppercase;color:var(--dim);border-bottom:1.5px solid var(--rule);
  padding:.4rem .55rem;white-space:nowrap;background:var(--wash)}
td{padding:.38rem .55rem;border-bottom:1px solid var(--hair);vertical-align:top}
tbody tr:hover{background:var(--wash)}
td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
table.grid td{text-align:center;font-variant-numeric:tabular-nums;padding:.3rem .2rem}
table.grid td:first-child{text-align:left;font-weight:600;white-space:nowrap}

/* facts */
.facts{display:grid;grid-template-columns:auto 1fr;gap:.28rem 1.1rem;margin:.7rem 0 1rem;
  font-size:.94rem}
.facts dt{color:var(--dim);white-space:nowrap}
.facts dd{margin:0}

/* score */
.sc{display:inline-flex;align-items:center;gap:.45rem;white-space:nowrap}
.sc .bar{width:3.4rem;height:.36rem;background:var(--hair);border-radius:.2rem;
  overflow:hidden;flex:none}
.sc .bar i{display:block;height:100%}
.sc b{font-variant-numeric:tabular-nums;font-weight:600;font-size:.88rem}
.sc em{font-style:normal;color:var(--dim);font-size:.84rem}
.sc.hi .bar i{background:var(--hi)} .sc.hi b{color:var(--hi)}
.sc.mid .bar i{background:var(--mid)} .sc.mid b{color:var(--mid)}
.sc.lo .bar i{background:var(--lo)} .sc.lo b{color:var(--lo)}

.chip{display:inline-block;font-size:.74rem;padding:.06rem .42rem;border-radius:.9rem;
  border:1px solid var(--rule);color:var(--dim);margin-right:.24rem;white-space:nowrap}
.chip.good{border-color:#b6ccb9;background:#eef5ef;color:var(--hi)}
.chip.bad{border-color:#e0c0ba;background:#fbefec;color:var(--lo)}
.chip.warn{border-color:#e3d3ae;background:#fbf5e6;color:var(--mid)}

.withheld{border:1px solid var(--rule);border-left:3px solid var(--accent);
  background:var(--card);border-radius:.35rem;padding:.75rem 1rem;margin:1rem 0}
.withheld strong{display:block;font-size:.94rem;margin-bottom:.15rem}
.withheld p{margin:0;color:var(--dim);font-size:.9rem}

.year{border:1px solid var(--rule);background:var(--card);border-radius:.5rem;
  padding:1rem 1.25rem;margin:1.1rem 0;break-inside:avoid}
.year > h4{margin-top:0;font-size:1.22rem;color:var(--accent)}

@media (max-width:640px){
  .wrap{padding:1.5rem 1rem 4rem}
  h1{font-size:1.9rem} h2{font-size:1.3rem}
  .toc{columns:1}
  .facts{grid-template-columns:1fr;gap:.05rem .5rem}
  .facts dt{margin-top:.5rem}
}

@media (prefers-color-scheme:dark){
  :root{--ink:#e9e3d8;--dim:#a49c8f;--faint:#7b7367;--rule:#3a352d;--hair:#2b2721;
    --bg:#14120f;--card:#1c1915;--accent:#d0a06a;--hi:#7fb389;--mid:#d3ae67;--lo:#d98b7c;
    --wash:#1f1c17}
  .chip.good{background:#1c2a1f;border-color:#33502f}
  .chip.bad{background:#2c1c19;border-color:#5a332c}
  .chip.warn{background:#2b2418;border-color:#54432a}
}

@media print{
  @page{margin:16mm 14mm}
  body{background:#fff;color:#000;font-size:10.5pt}
  .wrap{max-width:none;padding:0}
  .sec.brk{break-before:page}
  .sec,.sub,.year,.withheld,table{break-inside:auto}
  h2,h3,h4{break-after:avoid}
  tr,.year,.withheld{break-inside:avoid}
  thead{display:table-header-group}
  .toc{columns:2;border:none;padding:0}
  a{color:#000;text-decoration:none}
  .noprint{display:none}
}
`;

export function document_(title: string, subtitle: string, bodyHtml: string): string {
  const entries = tocEntries();
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head><body><div class="wrap">
<header class="cover">
  <h1>${esc(title)}</h1>
  <p class="who">${esc(subtitle)}</p>
</header>
<nav class="toc" aria-label="Contents">
${entries.map((t) => `<a href="#${esc(t.id)}"><b>${t.n}</b>${esc(t.title)}</a>`).join('\n')}
</nav>
${bodyHtml}
</div></body></html>`;
}

export const PRINT_IS_THE_POINT =
  'A document this long is read on paper or not at all, so the print rules are load-bearing: '
  + 'page breaks between sections, `break-inside: avoid` on every row and card, and '
  + '`thead { display: table-header-group }` so a table spanning four pages carries its column '
  + 'headings onto each of them. Without the last one a reader on page three is looking at a '
  + 'grid of unlabelled numbers.';
