import { makeScene2D, Rect, Txt, Layout, Circle } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, easeOutCubic, sequence,
} from '@motion-canvas/core';
import { BASE, palette, GEM_ORDER } from '../styles/palette';
import { PillLabel } from '../components/PillLabel';
import { EditorWindow } from '../components/EditorWindow';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const normalized = clean.length === 3
    ? clean.split('').map((c) => `${c}${c}`).join('')
    : clean;
  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;

  return [h / 6, s, l];
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToHex(h: number, s: number, l: number): string {
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = l;
    g = l;
    b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function* tweenAccentHueLocked(
  window: EditorWindow,
  fromHex: string,
  toHex: string,
  duration: number,
) {
  const [, , fromL] = rgbToHsl(...hexToRgb(fromHex));
  const [targetH, targetS, targetL] = rgbToHsl(...hexToRgb(toHex));
  const steps = 18;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const lightness = fromL + (targetL - fromL) * t;
    const saturation = targetS * t;
    const next = hslToHex(targetH, saturation, lightness);
    yield* window.accentColor(next, duration / steps, easeInOutCubic);
  }
}

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  // --- Start: single greyscale window ---
  const singleWin = createRef<EditorWindow>();

  view.add(
    <EditorWindow
      ref={singleWin}
      accentColor={BASE.border}
      label="repo/"
      winWidth={560}
      winHeight={340}
      bodyFill="#00000000"
      placeholderBaseOpacity={0.24}
      extraPlaceholderLines={10}
    />,
  );

  yield* waitFor(0.5);

  // Color washes in — greyscale to Gold
  yield* tweenAccentHueLocked(singleWin(), BASE.text, palette.gold.dark.fg, 1.2);
  yield* waitFor(0.4);

  // Shrink to left side, make room for others
  yield* all(
    singleWin().position.x(-520, 0.6, easeInOutCubic),
    singleWin().scale(0.52, 0.6, easeInOutCubic),
  );

  // --- Reveal all 8 windows in a 4×2 grid ---
  const COLS = 4;
  const WIN_W = 300;
  const WIN_H = 185;
  const WIN_TOTAL_H = WIN_H + 32;
  const GAP_X = 18;
  const GAP_Y = 18;
  const TOTAL_W = COLS * WIN_W + (COLS - 1) * GAP_X;
  const startX = -TOTAL_W / 2 + WIN_W / 2;
  const rowOffsetY = WIN_TOTAL_H / 2 + GAP_Y / 2;

  const windowRefs = GEM_ORDER.map(() => createRef<EditorWindow>());
  const gemDots = GEM_ORDER.map(() => createRef<Circle>());

  view.add(
    <>
      <Layout  x={0} y={0}>
        {GEM_ORDER.map((gem, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          return (
            <EditorWindow
              ref={windowRefs[i]}
              accentColor={palette[gem].dark.mid}
              label={`${gem}/`}
              winWidth={WIN_W}
              winHeight={WIN_H}
              x={startX + col * (WIN_W + GAP_X)}
              y={row === 0 ? -rowOffsetY : rowOffsetY}
              opacity={0}
              scale={0.9}
            />
          );
        })}
      </Layout>
    </>,
  );

  // Fade out single window
  yield* singleWin().opacity(0, 0.3);

  // Stagger windows in
  yield* sequence(
    0.07,
    ...windowRefs.map(ref =>
      all(
        ref().opacity(1, 0.45, easeOutCubic),
        ref().scale(1, 0.45, easeOutCubic),
      ),
    ),
  );

  yield* waitFor(0.3);

  // Text label
  const labelRef = createRef<PillLabel>();
  view.add(
    <PillLabel
      ref={labelRef}
      text="One tint. One repo. Same focus."
      accentColor={palette.turquoise.dark.fg}
      y={270}
      opacity={0}
    />,
  );

  yield* labelRef().opacity(1, 0.5);
  yield* waitFor(0.5);

  // Fade out
  yield* all(
    ...windowRefs.map(r => r().opacity(0, 0.4)),
    labelRef().opacity(0, 0.4)
  );
});