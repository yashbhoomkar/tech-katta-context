# 25 — Premium colour options

Written **2026-11-13**. The owner: "The colour scheme on our website does not look premium. I showed the website to an
industry expert. Think of more premium colour schemes." **Options only. Nothing is changed on the site** until the
owner picks one. This would replace the colour part of spec 20 ("Katta Paper": cream paper and marigold).

## 1. Why the current look reads as "not premium"

- **Yellow is doing a loud job.** Marigold fills the main buttons, the logo, the highlighter under the headline, the
  current-row tints and the figure highlights. Bright yellow buttons read as consumer, sale or budget, not as a
  serious tool.
- **The page is tinted everywhere.** Cream paper, cream surfaces and pale-yellow tints all at once. Premium tech sites
  (Linear, Stripe, Vercel, Arc, Raycast) keep the page close to neutral and let one accent appear rarely.
- **Too many soft colours, not enough contrast in the hierarchy.** Ink on cream with yellow tints flattens the page.
  Premium palettes rely on near-black ink, near-white surfaces and one accent.
- Typography also matters (the highlighter band and the many mono capital labels). These options change **colour
  only**, so they can be judged side by side.

## 2. The four options

Every option keeps the same token roles (`frontend/src/theme/tokens.css`), so switching is a token swap. The figures
follow the tokens through `palette.js`, and status colours (passed, warning, failed) are unchanged. The exact values
are in `tools/palettes.js`. The screenshots below are the **real site**, built from `main` and rendered with each
palette (`tools/e2e/palette-shots.js`).

| | Option | Idea | Main button | Accent (links, highlights, figure path) | Risk |
|---|---|---|---|---|---|
| **A** | **Ink & Brass** (recommended) | Keep the warmth and the Indian brass/gold heritage, but quiet: near-neutral warm white, true black ink, **black** main buttons, brass used sparingly | Black, white text (white in dark) | Brass `#8a6a2f` (dark: `#d4b77c`) | Closest to the current identity, so the change is calm, not a rebrand |
| **B** | Graphite & Saffron | Monochrome like Vercel or Linear, with one saffron accent | Black (white in dark) | Saffron `#c2410c` (dark: `#fb923c`) | The warning colour is also orange; it would need to move (for example to amber) |
| **C** | Midnight Indigo | Cool neutrals and a deep indigo brand, like Stripe | Indigo `#4338ca` | Indigo | Common in SaaS; the owner rejected blue earlier ("cold") |
| **D** | Oxblood & Ivory | Editorial: ivory page, deep oxblood (kumkum red) | Oxblood `#7a1f2b` | Oxblood | Brand red next to "failed" red in results; the danger colour would need to move |

Pictures (in `ui-redesign/palettes/`): `pal-landing-light.png`, `pal-landing-dark.png`, `pal-article-light.png` (a
problem workspace), `pal-article-dark.png`, `pal-phone-light.png`, `pal-phone-dark.png`. Each sheet shows the current
look and A to D.

## 3. Recommendation: A, Ink & Brass

- **Premium comes from restraint:** black primary buttons and a near-neutral page are what the best tool sites do.
  One accent, used rarely, reads as confident.
- **It keeps what is ours:** warmth, the gold family (brass is marigold's grown-up sibling), the highlighter idea
  (now a soft brass band), and Fraunces headings. Readers who know the site still recognise it.
- **No new conflicts:** brass doesn't clash with any status colour (green, orange, red).
- **Dark mode is the strongest of the four:** a near-black page, white primary buttons and gold accents.

If A is chosen, the follow-ups, each small and in its own PR:
1. Swap the token values in `tokens.css` and `palette.js` (the theme test keeps them in step). Check every page for
   AA contrast (§4.1 of spec 20 lists the pairs).
2. Make the highlighter thinner (a 3 px underline instead of a band), and use mono capital labels only where they
   label data.
3. Update the link preview image (`og-2026-11.png`) and the share card (`practice/card.js` reads `TOKENS`, so it
   follows automatically).

## 4. Owner decision

Pick **A**, **B**, **C**, **D**, or "keep the current one". A mix also works (for example, A's neutrals with C's
accent).
