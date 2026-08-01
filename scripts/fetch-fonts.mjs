// Fetch "Cabinet Grotesk" (Fontshare) + "Inter Tight" (Google Fonts) and
// self-host them locally so the site has no external font host at runtime.
// Writes src/assets/fonts/fonts.css with @font-face pointing at local files.
import { writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const FONT_DIR = new URL("../src/assets/fonts/", import.meta.url).pathname;
await mkdir(FONT_DIR, { recursive: true });
// Clear previous hashed downloads so we don't accumulate stale files.
for (const f of await readdir(FONT_DIR)) {
  if (!f.endsWith(".css")) await rm(join(FONT_DIR, f), { force: true });
}

const sources = [
  {
    family: "Cabinet Grotesk",
    url: "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap",
  },
  {
    family: "Inter Tight",
    url: "https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
  },
];

const faces = [];

for (const src of sources) {
  const css = await (await fetch(src.url, { headers: { "User-Agent": UA } })).text();

  // Split into @font-face blocks.
  const blocks = css.split("@font-face").slice(1);

  for (const block of blocks) {
    const urlMatch = block.match(/url\((['"]?)([^)'"]+)\1\)\s*format\('woff2'\)/);
    if (!urlMatch) continue;
    let url = urlMatch[2];
    if (url.startsWith("//")) url = "https:" + url;

    // Skip subset blocks (unicode-range present) unless this is the Latin
    // subset — Google splits each weight across cyrillic/greek/latin etc.
    // and we only want the Latin file per weight.
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);
    if (rangeMatch && !rangeMatch[1].includes("U+0000-00FF")) continue;

    const weight = (block.match(/font-weight:\s*(\d+)/) || [])[1] || "400";
    const style = (block.match(/font-style:\s*(\w+)/) || [])[1] || "normal";

    const slug = src.family.toLowerCase().replace(/\s+/g, "-");
    const file = `${slug}-${weight}${style === "italic" ? "i" : ""}.woff2`;

    const bytes = await (await fetch(url, { headers: { "User-Agent": UA } })).arrayBuffer();
    await writeFile(join(FONT_DIR, file), Buffer.from(bytes));
    console.log(`saved ${file}`);

    faces.push(
      `@font-face {\n  font-family: '${src.family}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('./${file}') format('woff2');\n}`
    );
  }
}

await writeFile(join(FONT_DIR, "fonts.css"), faces.join("\n\n") + "\n");
console.log(`fonts.css written with ${faces.length} faces`);
