// Renders one listing in both formats: node render.mjs <id> [portrait|landscape ...]
// Output: renders/<slug>-<format>.mp4. Rebuilds the composition before each render.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const [id = "19", ...requested] = process.argv.slice(2);
const formats = requested.length ? requested : ["portrait", "landscape"];
const { slug } = JSON.parse(readFileSync(new URL(`./properties/${id}.json`, import.meta.url), "utf8"));
const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1", DO_NOT_TRACK: "1" };
const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit", env, cwd: new URL(".", import.meta.url) });

for (const format of formats) {
  run("node", ["build.mjs", id, format]);
  run("npx", ["--yes", "hyperframes@0.8.189", "check"]);
  run("npx", ["--yes", "hyperframes@0.8.189", "render", "--strict", "--quiet", "-o", `renders/${slug}-${format}.mp4`]);
}
// Leave the default (portrait) build in place for `npm run dev`.
if (formats.at(-1) !== "portrait") run("node", ["build.mjs", id, "portrait"]);
