// Bundle once, render many stills: node scripts/stills.mjs Scene-bo 10 100 200
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [comp, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_CHROME || null;
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
for (const f of frames) {
  await renderStill({ composition, serveUrl, output: `out/stills/${comp}-${f}.png`, frame: Number(f), browserExecutable });
}
console.log("done", frames.join(","));
