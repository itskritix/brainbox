// Dev utility: open the landing page, drive the widget's capture flow, and
// screenshot each composer state plus the resolved token colours. Not part of
// `pnpm verify` - it needs a running dev server and a local Chromium.
//
//   node scripts/shoot.mjs http://localhost:5199
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const TARGET = process.argv[2] ?? "http://localhost:5199";
const OUT = new URL("../.shots/", import.meta.url).pathname;
const CHROME =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream", // auto-grant the mic
    "--use-fake-device-for-media-stream", // synthetic audio so the meter moves
    "--autoplay-policy=no-user-gesture-required",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
await page.goto(TARGET, { waitUntil: "networkidle2" });

/** The widget lives in a shadow root; reach in for the composer panel. */
const panel = () =>
  page.evaluateHandle(() => {
    const root = document.getElementById("brainbox-widget")?.shadowRoot;
    return root?.querySelector(".fixed.w-96") ?? null;
  });

const shoot = async (name) => {
  const el = await panel();
  if (!el || !(await el.evaluate((n) => !!n))) {
    console.log(`  ! ${name}: panel not found`);
    return;
  }
  await el.asElement().screenshot({ path: `${OUT}${name}.png` });
  console.log(`  ✓ ${OUT}${name}.png`);
};

/** Click the first button in the shadow root whose text contains `label`. */
const clickButton = (label) =>
  page.evaluate((l) => {
    const root = document.getElementById("brainbox-widget")?.shadowRoot;
    const btn = [...(root?.querySelectorAll("button") ?? [])].find((b) =>
      `${b.getAttribute("aria-label") ?? ""} ${b.textContent ?? ""}`.includes(l),
    );
    if (btn instanceof HTMLElement) {
      btn.click();
      return true;
    }
    return false;
  }, label);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// --- resolved token colours: the theme bug this run is checking ---
const tokens = await page.evaluate(() => {
  const host = document.getElementById("brainbox-widget");
  const dark = host?.shadowRoot?.querySelector(".dark");
  if (!dark) return { error: "no .dark wrapper" };
  const s = getComputedStyle(dark);
  const get = (n) => s.getPropertyValue(n).trim();
  return {
    "--gray-2": get("--gray-2"),
    "--gray-12": get("--gray-12"),
    "--bg-elevated": get("--bg-elevated"),
    "--bg-background": get("--bg-background"),
    "--text-emphasis": get("--text-emphasis"),
    "--text-muted": get("--text-muted"),
  };
});
console.log("resolved tokens on the .dark wrapper:");
for (const [k, v] of Object.entries(tokens)) console.log(`  ${k.padEnd(18)} ${v}`);

// --- drive the flow: open -> pick Screenshot -> drag a region -> compose ---
await page.evaluate(() => window.Brainbox?.open());
await wait(400);
console.log("clicked Screenshot:", await clickButton("Screenshot"));
await wait(400);

await page.mouse.move(300, 300);
await page.mouse.down();
await page.mouse.move(900, 520, { steps: 12 });
await page.mouse.up();
await wait(3000); // let the rasterise land

console.log("composer states:");
await shoot("1-idle");

console.log("clicked Prefer to type:", await clickButton("Prefer to type"));
await wait(300);
await shoot("2-typing");

// Record a couple of seconds of synthetic audio to exercise the meter.
console.log("clicked mic:", await clickButton("Record a voice note"));
await wait(2200);
await shoot("3-recording");
console.log("clicked stop:", await clickButton("Stop recording"));
await wait(600);
await shoot("4-recorded");

await browser.close();
