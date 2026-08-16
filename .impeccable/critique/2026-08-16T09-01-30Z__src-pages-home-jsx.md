---
target: the site (home page and conversion path)
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-16T09-01-30Z
slug: src-pages-home-jsx
---
⚠️ DEGRADED: single-context (session policy forbids spawning sub-agents without an explicit request)

Target: `src/pages/Home.jsx` and the conversion path it opens. Evidence for this run comes from the freshly built `dist/` (88/88 prerendered routes), not from production — production still serves the previous build, so these fixes are not live yet.

## Design Health Score

| # | Heuristic | Score | Change | Key Issue |
|---|-----------|-------|--------|-----------|
| 1 | Visibility of System Status | 3 | = | Route transitions remain silent |
| 2 | Match System / Real World | 3 | **+1** | Visitor-facing copy is now English throughout; the home and catalog `<title>` a buyer sees in the tab and in search results is still Spanish |
| 3 | User Control and Freedom | 3 | = | |
| 4 | Consistency and Standards | 2 | = | "Journal" in the header, "Blog" in the footer, same URL; two hero CTAs to the same page; `/venta/málaga` accented beside `/venta/casabermeja` |
| 5 | Error Prevention | 3 | = | |
| 6 | Recognition Rather Than Recall | 3 | = | Still no shortlist, so candidate properties live in the buyer's memory |
| 7 | Flexibility and Efficiency | 2 | = | No sort, no saved search, no favourites, no compare |
| 8 | Aesthetic and Minimalist Design | 3 | = | Hero still carries two CTAs and two unfalsifiable claims (kept by decision) |
| 9 | Error Recovery | 3 | = | |
| 10 | Help and Documentation | 2 | = | Nothing on the Spanish purchase process for a non-resident |
| **Total** | | **27/40** | **+1** | **Acceptable — one point below Good** |

## Design Specificity Verdict

**LLM assessment:** unchanged from the previous run, and that is the point. This pass fixed defects, not character. The surface remains authored — warm ink and gold, Playfair over Inter, real portfolio photography, architectural restraint — while the page skeleton remains the category default: hero, featured grid, three-icon virtue triad, journal teasers, lead magnet. The triad is still the same-size-cards-with-icon scaffold, and its three promises still read as any boutique agency's.

**Deterministic scan:** `detect.mjs --json` over `src/pages`, `src/components` and `index.html` returns `[]`, exit 0. Clean, as before. Worth repeating what that means and does not mean: the detector reads source, not rendered text, so it was blind to every defect this round fixed. A clean detector is not a clean page.

**Visual overlays:** unavailable. Screenshots still fail here ("the Browser pane is not displayed, so the page is not compositing frames"). Evidence for this run is the prerendered HTML in `dist/`, plus the live-site accessibility tree and DOM measurements captured in the previous run for the issues that remain untouched.

## What Changed Since the Last Run

Verified against the built output, not the source:

- The site h1 now reads `Elevate your portfolio with the most unique properties in Southern Spain`. It previously welded "portfoliowith" and carried a stray double space.
- No English route contains "Contactar por email", "Socio Estratégico", "Propiedades Similares" or "Interés en la propiedad". The property page's secondary action reads "Email us about this property" and its mailto subject is "Enquiry:".
- The home page Journal block now shows three English articles instead of one English and two Spanish.
- Video captions no longer print upload filenames, and every `<video>` carries an `aria-label` naming the estate.
- A second `useProperties()` call sitting after an early return is gone; the eslint rules-of-hooks violation with it.

## Overall Impression

One point. Three P1 fixes moved the score from 26 to 27, and that is an honest reflection of where the problems live rather than a sign the work was wasted. Everything fixed this round loaded into a single heuristic, because it was all one failure wearing different clothes: the site spoke Spanish to an English-speaking buyer at four separate moments. That is now closed, and the moment of contact — the end of the journey, where the peak-end rule does its damage — no longer breaks.

What holds the score at 27 is what was deliberately deferred: no way to hold more than one property in mind, 15-pixel breadcrumbs on a phone, two names for the same destination, and no guidance anywhere on what buying in Spain actually involves for a foreigner. None of those are defects. They are missing product.

The site has stopped doing things wrong. It has not yet started doing the things that would make a €2M buyer choose this agency over the one with the same photographs.

## What's Working

1. **The language failure is genuinely closed, not patched.** The Journal filter reuses the same `detectLang` that decides each article's `lang` attribute, so one mechanism now drives both the declared language and the editorial selection. The video fix treats a filename as absent rather than special-casing the two rows that exist today, so it holds for whatever gets uploaded next.
2. **The property page carries real substance.** Price per square metre beside the asking price, hectares as well as built area, six numbered photographs, and an FAQ that answers what a foreign buyer actually asks.
3. **The accessibility scaffolding is real.** Skip link first in the DOM, one h1 per page, breadcrumbs with `aria-current`, every field labelled, zero horizontal overflow at 375px.

## Priority Issues

### [P1] Nothing lets a buyer hold more than one property in mind

**What:** no favourites, no shortlist, no compare, no sort. Filters narrow; they never collect. Promoted from P2 because with the language defects gone, this is now the largest single gap between the site and the way the purchase actually happens.

**Why it matters:** nobody buys a €2M estate on first view. The real behaviour is comparing four or five candidates over weeks, across devices, usually with a partner. Today that means browser tabs and memory. The agency also never learns which properties a lead is weighing, which is the most commercially valuable signal in the funnel and the one thing a boutique agency can act on personally.

**Fix:** a saved shortlist persisted locally at minimum, a count in the header, and a compare view of price, hectares, built area and location.

**Suggested command:** `/impeccable shape`

### [P2] Breadcrumbs are 15 pixels tall on a phone

**What:** measured live at 375×812: breadcrumb links render 15px high, footer links 36px, the footer email link 19px. 26 interactive elements sit under the 44px minimum.

**Why it matters:** breadcrumbs are the main way back to a filtered result set after opening a property. At 15px a mis-tap sends the buyer to a different province.

**Fix:** vertical padding to reach 44px on touch viewports.

**Suggested command:** `/impeccable adapt`

### [P2] Two names for one destination, two buttons for one decision

**What:** the header says "Journal", the footer says "Blog", both point at `/blog`. The hero offers "View Property Portfolio" and "Explore Rural Estates", both landing on the catalog, one merely pre-filtered. Province URLs are inconsistent: `/venta/málaga` carries an accent, `/venta/casabermeja` does not.

**Why it matters:** each one is small; together they are the difference between a site that was designed and a site that accumulated. A buyer who notices one starts noticing the others.

**Fix:** pick one name for the Journal. Demote the second hero button to a text link under the primary. Slugify province URLs consistently and redirect the accented form.

**Suggested command:** `/impeccable clarify`

### [P2] Nothing explains what buying in Spain involves for a non-resident

**What:** one FAQ line per property asks "Can a foreigner buy property in Spain?". Beyond that, nothing on NIE, notary, transfer tax, timeline, or currency.

**Why it matters:** this is the single largest source of hesitation for the exact buyer the site targets, and it is the one thing a boutique agency can answer better than a portal. It is also the strongest reason for that buyer to hand over an email address.

**Fix:** a buyer's guide as a real page, not a PDF behind a form — then use the form to offer the property-specific version.

**Suggested command:** `/impeccable onboard`

## Persona Red Flags

**Henrik (project-specific: Scandinavian buyer, €2–3M, no Spanish):** the journey now holds together in English from hero to contact, which it did not before. What still fails him: the browser tab says "Casas Rurales y Chalets en Cádiz, Huelva y Sevilla" while the page reads English, and he still finds nothing anywhere about what buying here will require of him as a non-resident. He has one email address to give and no reason yet to give it.

**Casey (distracted mobile user):** taps a 15px breadcrumb to return to the Málaga results and lands elsewhere. Finds an estate she likes, cannot save it, gets interrupted, returns to a home page that has forgotten her. The contact form still sits below a long description, a features grid, two videos, a map and a five-question FAQ.

**Riley (deliberate stress tester):** the h1 is now correct in view-source and the filenames are gone. He still finds "Journal" in the header against "Blog" in the footer, two hero buttons to the same catalog, and one province URL with an accent that its neighbours do not have.

## Minor Observations

- The home and catalog `<title>` remain Spanish by decision. That is a defensible SEO trade, but it is worth knowing it is visible: it is the text in the browser tab, the bookmark, and the Google result an English speaker clicks.
- The property FAQ is a static `div` with five long answers always open, pushing the contact form further down on mobile.
- The investment-range select still uses "Select a range" as a selectable option rather than a disabled placeholder.
- Two dead variables remain in `PropertyDetail.jsx` (`getCustomSlugForId`, `canonicalSlug`), flagged by eslint and untouched because they predate this work.

## Questions to Consider

- What would the site look like if it assumed the buyer will visit six times over two months rather than once?
- The strongest asset in the whole site is the estate photography and the writing about the mill. Why does the home page still lead with a value proposition instead of with an estate?
- If a buyer gives you one email address in their entire search, what do they get back that a portal cannot send them?
- Is "Journal" earning a top-level navigation slot, or is it a footer link that happens to be good?
