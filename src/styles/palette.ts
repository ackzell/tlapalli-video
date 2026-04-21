// Tlapalli palette — sourced directly from themePalette in the theme repo
// Used as the single source of truth for all Motion Canvas scenes

export const palette = {
  obsidian: {
    dark: {
      bg: "#020202",
      fg: "#5c5c5c",
      mid: "#a7a7a7",
      widgetBg: "#0d0d0d",
      widgetHover: "#1b1b1b",
      border: "#141414",
    },
    light: {
      bg: "#fdfdfd",
      fg: "#a3a3a3",
      mid: "#dfdfdf",
      widgetBg: "#f2f2f2",
      widgetHover: "#dfdfdf",
      border: "#eaeaea",
    },
  },
  gold: {
    dark: {
      bg: "#090705",
      fg: "#80684e",
      mid: "#906f4d",
      widgetBg: "#15100b",
      widgetHover: "#4d3a1a",
      border: "#1a1514",
    },
    light: {
      bg: "#faf8f6",
      fg: "#b1997f",
      mid: "#e1d2bd",
      widgetBg: "#f4efea",
      widgetHover: "#e1d2bd",
      border: "#ebe6e5",
    },
  },
  turquoise: {
    dark: {
      bg: "#050909",
      fg: "#3d7f7d",
      mid: "#4d8d8e",
      widgetBg: "#091010",
      widgetHover: "#1a4d4b",
      border: "#0d1818",
    },
    light: {
      bg: "#f6fafa",
      fg: "#689897",
      mid: "#b2e5e3",
      widgetBg: "#eff6f6",
      widgetHover: "#b2e5e3",
      border: "#e7f2f2",
    },
  },
  quartz: {
    dark: {
      bg: "#0a0509",
      fg: "#7f3d5f",
      mid: "#90496b",
      widgetBg: "#140912",
      widgetHover: "#4d1a3a",
      border: "#1a1418",
    },
    light: {
      bg: "#faf5f9",
      fg: "#bb779a",
      mid: "#e5b2d2",
      widgetBg: "#f6ebf4",
      widgetHover: "#e5b2d2",
      border: "#ebe5e9",
    },
  },
  lapisLazuli: {
    dark: {
      bg: "#070a0d",
      fg: "#3d5f7f",
      mid: "#4d6f90",
      widgetBg: "#0c141a",
      widgetHover: "#1a3a4d",
      border: "#14151a",
    },
    light: {
      bg: "#f2f5f8",
      fg: "#80a2c2",
      mid: "#b2d2e3",
      widgetBg: "#e5edf3",
      widgetHover: "#b2d2e3",
      border: "#e5e6eb",
    },
  },
  amethyst: {
    dark: {
      bg: "#060407",
      fg: "#9482ac",
      mid: "#9d89b7",
      widgetBg: "#10101c",
      widgetHover: "#2a1a4d",
      border: "#1c1424",
    },
    light: {
      bg: "#faf8fb",
      fg: "#a087c0",
      mid: "#cbb2e3",
      widgetBg: "#f4f1f9",
      widgetHover: "#cbb2e3",
      border: "#e3dbeb",
    },
  },
  jade: {
    dark: {
      bg: "#070b09",
      fg: "#3d7f5f",
      mid: "#4d906f",
      widgetBg: "#0b1410",
      widgetHover: "#1a4d2e",
      border: "#0f1b15",
    },
    light: {
      bg: "#f4f8f6",
      fg: "#74a890",
      mid: "#b2e5c3",
      widgetBg: "#ebf4f0",
      widgetHover: "#b2e5c3",
      border: "#e4f0ea",
    },
  },
  fireOpal: {
    dark: {
      bg: "#0c0707",
      fg: "#ad6969",
      mid: "#9f5151",
      widgetBg: "#150c0c",
      widgetHover: "#4d1a1a",
      border: "#241313",
    },
    light: {
      bg: "#f8f3f3",
      fg: "#c36969",
      mid: "#e5b2b2",
      widgetBg: "#f3eaea",
      widgetHover: "#e5b2b2",
      border: "#ecdbdb",
    },
  },
} as const;

export type GemName = keyof typeof palette;
export type GemMode = "dark" | "light";

// Ordered list used for sequential reveal animations
export const GEM_ORDER: GemName[] = [
  "obsidian",
  "gold",
  "turquoise",
  "quartz",
  "lapisLazuli",
  "amethyst",
  "jade",
  "fireOpal",
];

// Display names shown in the video
export const GEM_LABELS: Record<GemName, string> = {
  obsidian: "Obsidian",
  gold: "Gold",
  turquoise: "Turquoise",
  quartz: "Quartz",
  lapisLazuli: "Lapis Lazuli",
  amethyst: "Amethyst",
  jade: "Jade",
  fireOpal: "Fire Opal",
};

// Base values used across all scenes
export const BASE = {
  bg: "#020202", // global background
  text: "#5c5c5c", // default body text
  textMid: "#a7a7a7", // accent / highlight text
  surface: "#0d0d0d", // widget surfaces
  surfaceHi: "#1b1b1b", // hovered / elevated surfaces
  border: "#141414", // borders
  font: "Oswald",
  mono: "JetBrains Mono, monospace",
  titleFont: "Prompt",
};
