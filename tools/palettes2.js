// Round 2, from the reference sites. Each option: token overrides (light/dark) + `extra` CSS for things tokens can't
// express yet (main buttons in ink while --brand stays marigold for the logo, figures and markers; lighter headings).
const BTN = ".btn.primary,.pr-solve,.sv-submit,.lab-btn:not(.ghost),.r-btn.primary,.acct-signin-link,.tour-next,.ll-score,.sd-copy,.pb-pick,.st-err button,.pr-primary,.lp-cta";
const inkButtons = (bg, fg, hover) => `:is(${BTN}){background:${bg}!important;color:${fg}!important;border-color:${bg}!important}:is(${BTN}):hover{background:${hover}!important;border-color:${hover}!important}`;
const lighter = `:is(h1,h2,.d-article h1,.hero h1,.d-panel h1,.pb h1){font-weight:500!important;letter-spacing:-.02em}`;
const thinMark = `h1 .tk-mark{background-image:linear-gradient(transparent 84%,var(--brand) 84%,var(--brand) 94%,transparent 94%)!important}`;
module.exports = {
  current: { name: "Current: Katta Paper" },
  "paper-ink": {
    name: "P1 · Paper & Ink, marigold as a signal (recommended)",
    light: { page: "#faf9f5", bg: "#ffffff", surface: "#f3f2ee", "surface-2": "#fbfaf7", hover: "#eeede8", inverse: "#141413", "on-inverse": "#faf9f5",
      ink: "#141413", "ink-2": "#2f2e2b", "ink-3": "#44423e", muted: "#5e5d58", "muted-2": "#696863", faint: "#74726c", disabled: "#d3d1ca",
      "line-strong": "#b9b7af", line: "#e6e4dd", "line-soft": "#dddbd3", grid: "#f0eee8", "brand-tint": "#fbf5e2", "brand-line": "#ecdcae",
      "accent-tint": "#fbf6ea", "accent-tint-2": "#f6ecd4", "ink-rgb": "20 20 19", "page-rgb": "250 249 245" },
    dark: { page: "#121211", bg: "#1a1a18", surface: "#21211f", "surface-2": "#161615", hover: "#272725", inverse: "#f2f1ec", "on-inverse": "#141413",
      ink: "#f2f1ec", "ink-2": "#d6d4cd", "ink-3": "#c3c1b9", muted: "#a2a098", "muted-2": "#96948c", faint: "#87857e", line: "#2c2c29", "line-soft": "#353531", "line-strong": "#4c4b46", grid: "#1c1c1a",
      "brand-tint": "#2a2414", "brand-line": "#4f4218", "accent-tint": "#221e12", "accent-tint-2": "#2c2615", "bg-rgb": "26 26 24", "page-rgb": "18 18 17" },
    extra: { light: inkButtons("#141413", "#faf9f5", "#2f2e2b") + lighter + thinMark, dark: inkButtons("#f2f1ec", "#141413", "#ffffff") + lighter + thinMark } },
  "pure-mono": {
    name: "P2 · Pure white & black (Vercel / Figma)",
    light: { page: "#ffffff", bg: "#ffffff", surface: "#f5f5f5", "surface-2": "#fafafa", hover: "#f0f0f0", inverse: "#0a0a0a", "on-inverse": "#ffffff",
      ink: "#0a0a0a", "ink-2": "#262626", "ink-3": "#404040", muted: "#525252", "muted-2": "#5e5e5e", faint: "#737373", disabled: "#d4d4d4",
      "line-strong": "#a3a3a3", line: "#e5e5e5", "line-soft": "#dcdcdc", grid: "#f2f2f2",
      brand: "#0a0a0a", "brand-strong": "#262626", "brand-edge": "#0a0a0a", "on-brand": "#ffffff", "brand-ink": "#0a0a0a", "brand-line": "#d4d4d4", "brand-tint": "#f5f5f5", mark: "#e5e5e5",
      accent: "#0a0a0a", "accent-strong": "#000000", "accent-mid": "#a3a3a3", "accent-line": "#d4d4d4", "accent-soft": "#e5e5e5", "accent-tint-2": "#efefef", "accent-tint": "#f7f7f7", "on-accent": "#ffffff", star: "#0a0a0a",
      "ink-rgb": "10 10 10", "page-rgb": "255 255 255", "accent-rgb": "10 10 10" },
    dark: { page: "#000000", bg: "#0a0a0a", surface: "#141414", "surface-2": "#050505", hover: "#1a1a1a", inverse: "#ededed", "on-inverse": "#0a0a0a",
      ink: "#ededed", "ink-2": "#cfcfcf", "ink-3": "#bdbdbd", muted: "#a1a1a1", "muted-2": "#939393", faint: "#858585", disabled: "#333333",
      "line-strong": "#454545", line: "#232323", "line-soft": "#2b2b2b", grid: "#0f0f0f",
      brand: "#ededed", "brand-strong": "#ffffff", "brand-edge": "#ededed", "on-brand": "#0a0a0a", "brand-ink": "#ededed", "brand-line": "#333333", "brand-tint": "#1a1a1a", mark: "#333333",
      accent: "#ededed", "accent-strong": "#ffffff", "accent-mid": "#737373", "accent-line": "#333333", "accent-soft": "#262626", "accent-tint-2": "#1c1c1c", "accent-tint": "#141414", "on-accent": "#0a0a0a", star: "#ededed",
      "bg-rgb": "10 10 10", "page-rgb": "0 0 0", "accent-rgb": "237 237 237" },
    extra: { light: lighter, dark: lighter } },
  "obsidian": {
    name: "P3 · Obsidian, dark first (Linear / Raycast)",
    light: {}, // light theme would be P1's
    dark: { page: "#08090a", bg: "#0f1011", surface: "#16171a", "surface-2": "#0c0d0e", hover: "#1c1d20", inverse: "#f7f8f8", "on-inverse": "#08090a",
      ink: "#f7f8f8", "ink-2": "#d0d6e0", "ink-3": "#b4bcc8", muted: "#8a8f98", "muted-2": "#80858e", faint: "#737881", disabled: "#2a2c30",
      "line-strong": "#3a3d42", line: "#1f2124", "line-soft": "#26282c", grid: "#121315",
      "brand-tint": "#1d1a10", "brand-line": "#4a3d14", "accent-tint": "#17150e", "accent-tint-2": "#1f1b10", "accent-soft": "#2b2512",
      "bg-rgb": "15 16 17", "page-rgb": "8 9 10" },
    extra: { dark: inkButtons("#e6e6e6", "#08090a", "#ffffff") + lighter + thinMark } },
};
