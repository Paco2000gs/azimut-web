---
target: the site (home page and conversion path)
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-16T08-10-00Z
slug: src-pages-home-jsx
---
⚠️ DEGRADED: single-context (session policy forbids spawning sub-agents without an explicit request)

Target: `src/pages/Home.jsx`, evaluated across the live conversion path (home → property detail) on https://www.azimutproperty.com.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Breadcrumbs, active nav, form send/done states all present; route transitions are silent |
| 2 | Match System / Real World | 2 | An English page hands a Spanish CTA ("Contactar por email") to a foreign buyer, and shows `25_en.mp4` as a video label |
| 3 | User Control and Freedom | 3 | Breadcrumbs, back link, Escape on menu and popup, lightbox close |
| 4 | Consistency and Standards | 2 | "Journal" in the header, "Blog" in the footer, same destination; two hero CTAs to the same page; `/venta/málaga` accented next to `/venta/casabermeja` slugified |
| 5 | Error Prevention | 3 | Typed inputs, constrained investment ranges, required fields, mailto fallback |
| 6 | Recognition Rather Than Recall | 3 | Everything labelled, no icon-only nav; but no shortlist, so candidates live in the buyer's memory |
| 7 | Flexibility and Efficiency | 2 | Catalog filters exist; no sort, no saved search, no favourites, no compare |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained and coherent; the hero carries two CTAs plus two unfalsifiable trust claims |
| 9 | Error Recovery | 3 | Inline `role="alert"` messages that name the recovery |
| 10 | Help and Documentation | 2 | Property FAQs are good; nothing anywhere on the actual Spanish purchase process for a non-resident |
| **Total** | | **26/40** | **Acceptable — significant improvements needed** |

## Design Specificity Verdict

**LLM assessment:** the surface is authored, the skeleton is not. Warm ink-and-gold palette, Playfair over Inter, near-square radii, real portfolio photography of the estates actually for sale — none of that is interchangeable, and a competitor could not lift it unchanged. But the page structure underneath is the category default: hero, featured grid, three-icon "why choose us" triad, journal teasers, lead magnet. The triad is precisely the same-size-cards-of-icon-plus-heading-plus-text scaffold, and its three claims (Unparalleled Expertise, Confidential Service, Exclusive Listings Access) are what every boutique agency writes. The distinctiveness is in the paint, not the architecture.

**Deterministic scan:** `detect.mjs --json` over `src/pages`, `src/components` and `index.html` returned `[]`, exit 0. Clean. The detector caught nothing the review found, and the review found nothing the detector should have caught — it does not read live rendered text, which is where this run's worst defect lives.

**Visual overlays:** not available. Screenshots fail in this environment ("the Browser pane is not displayed, so the page is not compositing frames"), so no user-visible overlay was injected. Fallback signal used instead: accessibility tree, computed DOM measurements and console on the live production site, desktop 1280×720 and mobile 375×812.

## Overall Impression

The technical foundation is now genuinely good, and the critique keeps finding problems above it — which is the right order for things to break. What works is the material: the photography earns the prices, the property page carries real specifics (price per m², hectares, the eighteenth-century mill, the Gold-Medal oil), and the forms are honest and well built.

What does not work is that the site forgets who it is talking to exactly when it matters most. A Scandinavian or British buyer reads an English hero, English specs, an English description — and then reaches the contact moment and is handed "Contactar por email", a mailto whose subject line is "Interés en la propiedad", and two videos labelled `25_en.mp4` and `25_es.mp4`. The peak-end rule is unforgiving here: the journey's emotional peak is the estate description, and its end is a language failure plus a leaked filename.

The single biggest opportunity: finish the English experience through to the contact action, and give buyers a way to hold more than one property in mind.

## What's Working

1. **The property page has real substance.** Price per square metre alongside the asking price, hectares as well as built area, six photographs each with numbered alt text, an FAQ that answers the question a foreign buyer actually asks ("Can a foreigner buy property in Casabermeja, Spain?"). Most luxury agency listings are three adjectives and a phone number.
2. **The inquiry form is well judged.** Optional fields are marked optional rather than left ambiguous, the investment range is a constrained select rather than a free-text field that nobody completes honestly, and the privacy line ("Your details stay with us. No newsletters, no third parties.") answers the objection at the moment it forms.
3. **The accessibility scaffolding is real, not decorative.** Skip link first in the DOM, one h1 per page, breadcrumbs with `aria-current`, every form field labelled, alt text that describes the property rather than naming the file. Mobile shows zero horizontal overflow at 375px.

## Priority Issues

### [P1] The site's H1 is malformed in production

**What:** the home page h1 reads `Elevate your portfoliowith the most unique  properties in Southern Spain` — no space after "portfolio", two spaces before "properties". JSX strips the whitespace between the `<span>` and the following line.

**Why it matters:** this is the single most important string on the site. Screen readers announce it as one broken word, Google indexes it as written, and any tool that extracts the page's headline repeats the error. CSS makes the two halves look separate on screen, which is exactly why it survived — it is invisible to a visual check and obvious to everything else.

**Fix:** put the space inside the markup: `{' '}` after the span, or move the whole line into a single expression.

**Suggested command:** `/impeccable clarify`

### [P1] The experience switches to Spanish at the contact moment

**What:** on an English property page — `lang="en"`, English title, English description — the secondary contact link reads "Contactar por email" and its mailto subject is "Interés en la propiedad: …". On the English home page, two of the three Journal teasers are Spanish articles. The footer credits a "Socio Estratégico".

**Why it matters:** the entire premise is the international buyer. Every Spanish string is a small signal that they are not the primary audience, and they arrive in the worst order — the buyer is convinced by the estate, reaches for contact, and is answered in a language they may not read.

**Fix:** translate the remaining strings and the mailto subject; filter the home page Journal block to the page's language rather than showing the three most recent regardless.

**Suggested command:** `/impeccable clarify`

### [P1] Raw filenames are shown as video labels

**What:** the €2.475.000 listing displays `25_en.mp4` and `25_es.mp4` as visible text beside its two videos.

**Why it matters:** it reads as an unfinished page. It also leaves the buyer guessing which video is in their language, and the fallback string "Your browser does not support the video tag." is exposed to the accessibility tree with no label of its own.

**Fix:** label the videos by what they are ("Estate tour — English") rather than by their upload name, and give each an `aria-label`.

**Suggested command:** `/impeccable clarify`

### [P2] Nothing lets a buyer hold more than one property in mind

**What:** no favourites, no shortlist, no compare, no sort in the catalog. Filters narrow; they do not collect.

**Why it matters:** nobody buys a €2M estate on first view. The real behaviour is comparing four or five candidates over weeks, across devices, usually with a partner. Today that means browser tabs and memory, and the agency never learns which properties a lead is weighing — which is the most commercially valuable signal in the funnel.

**Fix:** a saved shortlist, persisted locally at minimum, surfaced as a count in the header, with a compare view of price, hectares, built area and location.

**Suggested command:** `/impeccable shape`

### [P2] Breadcrumbs are 15 pixels tall on a phone

**What:** measured on the live site at 375×812, the breadcrumb links (Home, Properties, Málaga, Casabermeja) render 15px high. Footer navigation links are 36px; the footer email link is 19px. 26 interactive elements sit under the 44px minimum.

**Why it matters:** breadcrumbs are the primary way back to a filtered result set after opening a property. At 15px they are a coin toss, and a mis-tap on a neighbouring crumb sends the buyer to the wrong province.

**Fix:** vertical padding on the crumb links to reach 44px on touch viewports; same for footer links.

**Suggested command:** `/impeccable adapt`

## Persona Red Flags

**Henrik (project-specific: Scandinavian buyer, €2–3M, no Spanish):** reads the estate description with growing interest, then hits "Contactar por email" and a mailto that opens pre-filled with "Interés en la propiedad". Cannot tell which of `25_en.mp4` / `25_es.mp4` is his. Two of the three Journal articles on the home page are unreadable to him. Nothing anywhere explains what buying in Spain involves for a non-resident — NIE, notary, transfer tax, timeline — so the single largest source of his hesitation is unaddressed on every page.

**Casey (distracted mobile user):** taps a 15px breadcrumb to get back to the Málaga results and lands somewhere else. Finds a property she likes, has no way to save it, gets interrupted, and returns to a home page that has forgotten everything. The primary contact action sits below a long description, a features grid, two videos, a map and a five-question FAQ — far outside the thumb zone, reached only by sustained scrolling.

**Riley (deliberate stress tester):** notices the header says "Journal" and the footer says "Blog" for the same URL. Notices `/venta/málaga` carries an accent while `/venta/casabermeja` does not. Notices the hero offers two buttons that both land on the catalog, one of them merely pre-filtered. Finds the home page h1 broken in view-source within a minute.

## Minor Observations

- The hero's trust row — "Discreet Representation · Global Network Excellence" — is unfalsifiable in both halves. It occupies the most valuable space on the page and asserts nothing a buyer could check. A concrete number (estates under mandate, years in Andalusia, provinces covered) would earn its place.
- Two hero CTAs both lead to the catalog. That is one decision presented as two.
- Six top-level navigation items, one over the recommended five, and "Properties" and "Rural Estates" overlap in meaning.
- The property FAQ is a static `div`, not a disclosure widget — fine for accessibility, but five long answers stacked open push the contact form further down.
- The investment-range select uses "Select a range" as a selectable option rather than a disabled placeholder.

## Questions to Consider

- If a buyer could only take one thing away from the home page, what should it be? Right now the page offers a portfolio, a rural-estates filter, three virtues, three articles and a guide download — five destinations with near-equal weight.
- What would the site look like if it assumed the buyer will visit six times over two months, rather than once?
- The strongest asset in the whole site is the estate photography and the writing about the mill. Why does the home page lead with a value proposition instead of with an estate?
- Is "Journal" earning its place as a top-level destination when half its articles are in a language the target buyer does not read?
