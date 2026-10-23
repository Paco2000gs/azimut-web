// Builds the HyperFrames composition for one listing from properties/<id>.json.
// Usage: node build.mjs <id> [portrait|landscape]
//   portrait  → 1080×1920 (Reels, TikTok, Shorts), the default
//   landscape → 1920×1080 (YouTube, web, portals)
// Writes index.html and compositions/*.html. Both are build output: edit the JSON
// or this generator, then rebuild.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const id = process.argv[2] ?? "19";
const format = process.argv[3] ?? "portrait";
const p = JSON.parse(readFileSync(new URL(`./properties/${id}.json`, import.meta.url), "utf8"));

const DURATION = 30;

// Brand tokens from src/styles/variables.css on the website.
const BRAND = {
  ink: "#14130F",
  surface: "#F9F7F2",
  gold: "#C5A059",
  goldInk: "#8A6220",
  champagne: "#E5D5B0",
};

// Every position is in canvas pixels. Portrait keeps words inside the 168–1330 px
// band and clear of the right-hand action rail the apps draw over the frame.
const LAYOUTS = {
  portrait: {
    width: 1080,
    height: 1920,
    left: 96,
    contentWidth: 820,
    photoPosition: "50% 50%",
    hook: { top: 250, headline: 128, subline: 44 },
    land: { mask: "inset(0% 0% 56% 0%)", camY: -560, camX: 0, top: 900, left: 96, width: 820, figure: 80, label: 32, rowGap: 118, figureCol: 330 },
    feature: { top: 250, title: 104, titleLines: 2, subline: 42 },
    buildings: { top: 330, figure: 190, label: 36, second: { top: 760, left: 96 }, footerTop: 1210 },
    location: { top: 300, title: 72, titleWidth: 820, spineX: 132, originY: 560, stops: [770, 950, 1130], labelLeft: 190, right: 916, stopText: 48 },
    close: { logoTop: 300, logoWidth: 280, priceTop: 690, price: 140, optionTop: 880, ruleTop: 985, ctaTop: 1030, urlTop: 1078, url: 54 },
  },
  landscape: {
    width: 1920,
    height: 1080,
    left: 192,
    contentWidth: 1536,
    photoPosition: "50% 50%",
    hook: { top: 150, headline: 150, subline: 48 },
    land: { mask: "inset(0% 50% 0% 0%)", camY: 0, camX: 0, top: 280, left: 1040, width: 760, figure: 76, label: 32, rowGap: 160, figureCol: 340 },
    feature: { top: 150, title: 120, titleLines: 1, subline: 46 },
    buildings: { top: 300, figure: 200, label: 38, second: { top: 300, left: 1000 }, footerTop: 820 },
    location: { top: 200, title: 96, titleWidth: 760, spineX: 1060, originY: 200, stops: [420, 620, 820], labelLeft: 1110, right: 1728, stopText: 52 },
    close: { logoTop: 110, logoWidth: 200, priceTop: 380, price: 150, optionTop: 585, ruleTop: 665, ctaTop: 705, urlTop: 750, url: 56 },
  },
};

const L = LAYOUTS[format];
if (!L) throw new Error(`Unknown format "${format}": use portrait or landscape`);

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Splits a line into word spans so titles can enter word by word.
const words = (s) =>
  esc(s)
    .split(" ")
    .map((w) => `<span class="w">${w}</span>`)
    .join(" ");

// Shared by every scene script. Times passed to these helpers are film seconds;
// T0 (the scene's start) turns them into the scene's local clock.
const HELPERS = `
      const arrive = { opacity: 1, filter: "blur(0px)", y: 0 };
      const hidden = (y = 0) => ({ opacity: 0, filter: "blur(8px)", y });
      const at = (t) => +(t - T0).toFixed(3);
      const wordsIn = (sel, t) =>
        tl.fromTo(sel + " .w", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.067, ease: "power2.out" }, at(t));
      const landIn = (sel, t, y = 0, duration = 0.3) =>
        tl.fromTo(sel, hidden(y), { ...arrive, duration, ease: "expo.out" }, at(t));
      const blurOut = (sel, t) =>
        tl.fromTo(sel, { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in", immediateRender: false }, at(t));`;

const KICKER_CSS = `
      .kicker { position: absolute; left: ${L.left}px; font: 600 30px/1 var(--font-body); letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); }
      .on-photo { text-shadow: 0 2px 28px rgba(20, 19, 15, 0.35); }
      .on-photo.kicker { color: var(--surface); }`;

// Each scene: its slot in the film, its markup, its styles and its tweens.
const scenes = [
  {
    id: "ground",
    start: 0,
    duration: DURATION,
    z: 0,
    html: `<div id="ground-fill"></div>`,
    css: `#ground-fill { position: absolute; inset: 0; background: var(--ink); }`,
    js: `
      tl.fromTo("#ground-fill", { backgroundColor: "${BRAND.ink}" }, { backgroundColor: "${BRAND.surface}", duration: 0.4, ease: "power2.inOut" }, at(15.2));
      tl.fromTo("#ground-fill", { backgroundColor: "${BRAND.surface}" }, { backgroundColor: "${BRAND.ink}", duration: 0.4, ease: "power2.inOut", immediateRender: false }, at(19.5));
      tl.set({}, {}, at(${DURATION}));`,
  },
  {
    // The estate's photo, carried through the first three beats: full frame,
    // then a panel beside the figures, then full frame again on a new framing.
    id: "plate",
    start: 0,
    duration: 15.6,
    z: 1,
    html: `<div id="plate-mask"><div id="plate-cam"><img id="plate-img" src="${esc(p.photos.hero)}" alt="" /></div></div>`,
    css: `
      #plate-mask { position: absolute; inset: 0; overflow: hidden; clip-path: inset(0% 0% 0% 0%); }
      #plate-cam { position: absolute; inset: 0; transform-origin: 50% 30%; }
      #plate-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: ${L.photoPosition}; }`,
    js: `
      tl.fromTo("#plate-cam", { scale: 1.14, x: 0, y: 0 }, { scale: 1.2, duration: 4.5, ease: "power1.inOut" }, at(0));
      tl.fromTo("#plate-mask", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "${L.land.mask}", duration: 0.7, ease: "power2.inOut" }, at(4.5));
      tl.fromTo("#plate-cam", { scale: 1.2, x: 0, y: 0 }, { scale: 1.2, x: ${L.land.camX}, y: ${L.land.camY}, duration: 0.7, ease: "power2.inOut", immediateRender: false }, at(4.5));
      tl.fromTo("#plate-cam", { scale: 1.2 }, { scale: 1.24, duration: 5.3, ease: "none", immediateRender: false }, at(5.2));
      tl.fromTo("#plate-mask", { clipPath: "${L.land.mask}" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut", immediateRender: false }, at(10.5));
      tl.fromTo("#plate-cam", { scale: 1.24, x: ${L.land.camX}, y: ${L.land.camY} }, { scale: 1.26, x: -40, y: 0, duration: 0.8, ease: "power2.inOut", immediateRender: false }, at(10.5));
      tl.fromTo("#plate-cam", { scale: 1.26 }, { scale: 1.32, duration: 3.7, ease: "none", immediateRender: false }, at(11.3));
      tl.fromTo("#plate-mask", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.55, ease: "power3.in", immediateRender: false }, at(15.0));`,
  },
  {
    // Frame 0 is the thumbnail: the place and the headline are already there.
    id: "hook",
    start: 0,
    duration: 4.6,
    z: 2,
    html: `
      <div id="hook-inner">
        <div id="hook-kicker" class="kicker on-photo">${esc(p.location)}</div>
        <h1 id="hook-headline" class="on-photo">${esc(p.hook.headline)}</h1>
        <p id="hook-subline" class="on-photo">${words(p.hook.subline)}</p>
      </div>`,
    css: `${KICKER_CSS}
      #hook-inner { position: absolute; inset: 0; }
      #hook-kicker { top: ${L.hook.top}px; }
      #hook-headline { position: absolute; left: ${L.left}px; top: ${L.hook.top + 50}px; font: 600 ${L.hook.headline}px/1 var(--font-display); letter-spacing: -0.02em; }
      #hook-subline { position: absolute; left: ${L.left}px; top: ${L.hook.top + 70 + L.hook.headline}px; width: ${L.contentWidth}px; font: italic 400 ${L.hook.subline}px/1.25 var(--font-display); }`,
    js: `
      wordsIn("#hook-subline", 0.45);
      blurOut("#hook-inner", 4.3);`,
  },
  {
    id: "land",
    start: 4.5,
    duration: 6.1,
    z: 3,
    html: `
      <div id="land-block">
        <div id="land-kicker" class="kicker">${esc(p.land.kicker)}</div>${p.land.rows
          .map(
            (r, i) => `
        <div class="land-row" id="land-row-${i}" style="top:${60 + i * L.land.rowGap}px">
          <span class="figure">${esc(r.figure)}</span><span class="label">${esc(r.label)}</span>
        </div>`,
          )
          .join("")}
      </div>`,
    css: `${KICKER_CSS}
      #land-block { position: absolute; left: ${L.land.left}px; top: ${L.land.top}px; width: ${L.land.width}px; height: ${60 + 3 * L.land.rowGap}px; }
      #land-kicker { left: 0; top: 0; }
      .land-row { position: absolute; left: 0; width: 100%; display: flex; align-items: baseline; gap: 24px; }
      .land-row .figure { flex: 0 0 ${L.land.figureCol}px; font: 600 ${L.land.figure}px/1 var(--font-display); color: var(--gold); }
      .land-row .label { font: 400 ${L.land.label}px/1.2 var(--font-body); color: var(--surface); }`,
    js: `
      landIn("#land-kicker", 5.0);
      ${JSON.stringify(p.land.rows.map((_, i) => i))}.forEach((i) => landIn("#land-row-" + i, 5.3 + i * 1.3, 24, 0.6));
      blurOut("#land-block", 10.3);`,
  },
  {
    id: "feature",
    start: 10.6,
    duration: 4.6,
    z: 4,
    html: `
      <div id="feature-inner">
        <div id="feature-kicker" class="kicker on-photo">${esc(p.feature.kicker)}</div>
        <h2 id="feature-title" class="on-photo">${words(p.feature.title)}</h2>
        <p id="feature-subline" class="on-photo">${words(p.feature.subline)}</p>
      </div>`,
    css: `${KICKER_CSS}
      #feature-inner { position: absolute; inset: 0; }
      #feature-kicker { top: ${L.feature.top}px; }
      #feature-title { position: absolute; left: ${L.left}px; top: ${L.feature.top + 50}px; width: ${L.contentWidth}px; font: 600 ${L.feature.title}px/1.02 var(--font-display); letter-spacing: -0.02em; }
      #feature-subline { position: absolute; left: ${L.left}px; top: ${L.feature.top + 80 + L.feature.title * 1.02 * L.feature.titleLines}px; width: ${L.contentWidth}px; font: italic 400 ${L.feature.subline}px/1.25 var(--font-display); }`,
    js: `
      landIn("#feature-kicker", 11.0);
      wordsIn("#feature-title", 11.2);
      wordsIn("#feature-subline", 12.1);
      blurOut("#feature-inner", 14.9);`,
  },
  {
    id: "buildings",
    start: 15.4,
    duration: 4.4,
    z: 5,
    html: `
      <div id="bld-inner">
        <div id="bld-kicker" class="kicker">${esc(p.buildings.kicker)}</div>${p.buildings.items
          .map((b, i) => {
            const pos = i === 0 ? { top: L.buildings.top, left: L.left } : L.buildings.second;
            return `
        <div class="bld-item" id="bld-item-${i}" style="top:${pos.top}px;left:${pos.left}px">
          <div class="figure">${esc(b.figure)}</div>
          <div class="label">${esc(b.label)}</div>
        </div>`;
          })
          .join("")}
        <div id="bld-rule"></div>
        <div id="bld-footer">${esc(p.buildings.footer)}</div>
      </div>`,
    css: `${KICKER_CSS}
      #bld-inner { position: absolute; inset: 0; }
      #bld-kicker { top: ${L.buildings.top - 70}px; color: var(--gold-ink); }
      .bld-item { position: absolute; }
      .bld-item .figure { font: 600 ${L.buildings.figure}px/1 var(--font-display); letter-spacing: -0.03em; color: var(--ink); }
      .bld-item .label { margin-top: 18px; font: 500 ${L.buildings.label}px/1.2 var(--font-body); color: var(--ink); }
      #bld-rule { position: absolute; left: ${L.left}px; top: ${L.buildings.footerTop - 40}px; width: 120px; height: 3px; background: var(--gold); transform-origin: 0 50%; }
      #bld-footer { position: absolute; left: ${L.left}px; top: ${L.buildings.footerTop}px; font: 400 ${L.buildings.label}px/1.2 var(--font-body); color: var(--gold-ink); }`,
    js: `
      landIn("#bld-kicker", 15.6);
      landIn("#bld-item-0", 15.8, 30, 0.7);
      landIn("#bld-item-1", 16.6, 30, 0.7);
      tl.fromTo("#bld-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, at(17.5));
      landIn("#bld-footer", 17.7);
      blurOut("#bld-inner", 19.5);`,
  },
  {
    // A route diagram rather than a drawn map: the distances are the point, and a
    // hand-drawn coastline would misplace the town.
    id: "location",
    start: 19.8,
    duration: 5,
    z: 6,
    html: `
      <div id="loc-inner">
        <div id="loc-kicker" class="kicker">${esc(p.location_scene.kicker)}</div>
        <h2 id="loc-title">${words(p.location_scene.title)}</h2>
        <div id="loc-spine"></div>
        <div id="loc-origin"></div>
        <div id="loc-origin-label">${esc(p.location_scene.origin)}</div>${p.location_scene.stops
          .map(
            (s, i) => `
        <div class="stop" id="stop-${i}" style="top:${L.location.stops[i]}px">
          <span class="dot"></span><span class="place">${esc(s.place)}</span><span class="time">${esc(s.time)}</span>
        </div>`,
          )
          .join("")}
      </div>`,
    css: `${KICKER_CSS}
      #loc-inner { position: absolute; inset: 0; }
      #loc-kicker { top: ${L.location.top}px; }
      #loc-title { position: absolute; left: ${L.left}px; top: ${L.location.top + 50}px; width: ${L.location.titleWidth}px; font: 600 ${L.location.title}px/1.05 var(--font-display); letter-spacing: -0.02em; color: var(--surface); }
      #loc-spine { position: absolute; left: ${L.location.spineX - 1.5}px; top: ${L.location.originY}px; width: 3px; height: ${L.location.stops.at(-1) - L.location.originY}px; background: var(--gold); transform-origin: 50% 0; }
      #loc-origin { position: absolute; left: ${L.location.spineX - 22}px; top: ${L.location.originY - 22}px; width: 44px; height: 44px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 0 10px rgba(197, 160, 89, 0.22); }
      #loc-origin-label { position: absolute; left: ${L.location.labelLeft}px; top: ${L.location.originY - 26}px; font: 600 ${L.location.stopText}px/1 var(--font-display); color: var(--champagne); }
      .stop { position: absolute; left: 0; width: ${L.location.right}px; height: 0; }
      .stop .dot { position: absolute; left: ${L.location.spineX - 12}px; top: -12px; width: 24px; height: 24px; border-radius: 50%; background: var(--ink); border: 3px solid var(--gold); }
      .stop .place { position: absolute; left: ${L.location.labelLeft}px; top: -${L.location.stopText * 0.55}px; font: 400 ${L.location.stopText}px/1 var(--font-body); color: var(--surface); }
      .stop .time { position: absolute; right: 0; top: -${L.location.stopText * 0.55}px; font: 600 ${L.location.stopText}px/1 var(--font-display); color: var(--gold); }`,
    js: `
      landIn("#loc-kicker", 19.9);
      wordsIn("#loc-title", 20.0);
      tl.fromTo("#loc-origin", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.4)" }, at(20.6));
      landIn("#loc-origin-label", 20.75);
      tl.fromTo("#loc-spine", { scaleY: 0 }, { scaleY: 1, duration: 1.8, ease: "power2.inOut" }, at(21.0));
      ${JSON.stringify(p.location_scene.stops.map((_, i) => i))}.forEach((i) => landIn("#stop-" + i, 21.4 + i * 0.6, 0, 0.35));
      blurOut("#loc-inner", 24.5);`,
  },
  {
    id: "close",
    start: 24.8,
    duration: +(DURATION - 24.8).toFixed(1),
    z: 7,
    html: `
      <div id="close-inner">
        <img id="close-logo" src="assets/brand/azimut-logo-gold.png" alt="Azimut Property" />
        <div id="close-price" class="center">${esc(p.close.price)}</div>
        <div id="close-option" class="center">${esc(p.close.option)}</div>
        <div id="close-rule"></div>
        <div id="close-cta" class="center">${esc(p.close.cta)}</div>
        <div id="close-url" class="center">${esc(p.url)}</div>
      </div>`,
    css: `
      #close-inner { position: absolute; inset: 0; }
      #close-logo { position: absolute; left: ${(L.width - L.close.logoWidth) / 2}px; top: ${L.close.logoTop}px; width: ${L.close.logoWidth}px; }
      .center { position: absolute; left: 0; width: 100%; text-align: center; }
      #close-price { top: ${L.close.priceTop}px; font: 600 ${L.close.price}px/1 var(--font-display); letter-spacing: -0.02em; color: var(--surface); }
      #close-option { top: ${L.close.optionTop}px; font: 400 36px/1.2 var(--font-body); color: var(--champagne); }
      #close-rule { position: absolute; left: ${L.width / 2 - 60}px; top: ${L.close.ruleTop}px; width: 120px; height: 3px; background: var(--gold); }
      #close-cta { top: ${L.close.ctaTop}px; font: 600 28px/1 var(--font-body); letter-spacing: 0.22em; text-transform: uppercase; color: var(--surface); }
      #close-url { top: ${L.close.urlTop}px; font: 600 ${L.close.url}px/1.1 var(--font-display); color: var(--gold); }`,
    js: `
      tl.fromTo("#close-logo", { opacity: 0, filter: "blur(8px)", scale: 0.96 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "expo.out" }, at(24.9));
      landIn("#close-price", 25.4, 20, 0.6);
      landIn("#close-option", 26.1, 0, 0.4);
      tl.fromTo("#close-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, at(26.6));
      landIn("#close-cta", 26.8);
      landIn("#close-url", 27.0, 0, 0.4);
      tl.set({}, {}, at(${DURATION}));`,
  },
];

const sceneFile = (s) => `<!-- Generated by build.mjs from properties/${p.id}.json (${format}). -->
<template>
  <style>
    #root { position: absolute; inset: 0; font-family: var(--font-body); color: var(--surface); }
    ${s.css.trim()}
  </style>
  <div id="root" data-composition-id="${s.id}" data-width="${L.width}" data-height="${L.height}">
    ${s.html.trim()}
  </div>
  <script>
    (() => {
      const T0 = ${s.start};
      const tl = gsap.timeline({ paused: true });${HELPERS}
      ${s.js.trim()}
      window.__timelines["${s.id}"] = tl;
    })();
  </script>
</template>
`;

const index = `<!doctype html>
<!-- Generated by build.mjs from properties/${p.id}.json (${format}). Edit the JSON or the generator, then rebuild. -->
<html lang="es" data-resolution="${format}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${L.width}, height=${L.height}" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      :root {
        --ink: ${BRAND.ink};
        --surface: ${BRAND.surface};
        --gold: ${BRAND.gold};
        --gold-ink: ${BRAND.goldInk};
        --champagne: ${BRAND.champagne};
        --font-display: "Playfair Display", serif;
        --font-body: "Inter", sans-serif;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${L.width}px; height: ${L.height}px; overflow: hidden; background: var(--ink); }
      #root { position: relative; width: 100%; height: 100%; }
${scenes.map((s) => `      #root > #${s.id} { z-index: ${s.z}; }`).join("\n")}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DURATION}" data-width="${L.width}" data-height="${L.height}">
${scenes
  .map(
    (s, i) => `      <div
        id="${s.id}"
        data-composition-id="${s.id}"
        data-composition-src="compositions/${s.id}.html"
        data-start="${s.start}"
        data-duration="${s.duration}"
        data-track-index="${i}"
        data-track-kind="graphics"
        data-width="${L.width}"
        data-height="${L.height}"
      ></div>`,
  )
  .join("\n")}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;

const dir = new URL("./compositions/", import.meta.url);
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir);
for (const s of scenes) writeFileSync(new URL(`${s.id}.html`, dir), sceneFile(s));
writeFileSync(new URL("./index.html", import.meta.url), index);
console.log(`Built ${format} ${L.width}×${L.height} for listing ${p.id} (${scenes.length} scenes)`);
