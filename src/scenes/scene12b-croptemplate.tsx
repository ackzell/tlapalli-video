import { makeScene2D, Rect, Txt, Layout, Line } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, easeOutCubic,
  sequence, linear, loop, cancel, ThreadGenerator,
} from '@motion-canvas/core';
import { BASE, palette, GEM_ORDER } from '../styles/palette';
import { CropTemplate } from '../components/CropTemplate';
import { PillLabel } from '../components/PillLabel';

// Screenshot dimensions
const SS_W = 640;
const SS_H = 380;
// Crop region — slightly smaller than full screenshot
const CROP_W = 520;
const CROP_H = 300;

// Renders a single fake screenshot rect for a given gem
function fakeScreenshot(gemName: typeof GEM_ORDER[number], ref: ReturnType<typeof createRef<Rect>>) {
  const c = palette[gemName].dark;
  return (
    <Rect
      ref={ref}
      width={SS_W}
      height={SS_H}
      radius={8}
      fill={c.bg}
      stroke={c.border}
      lineWidth={1}
      clip
    >
      {/* Fake title bar */}
      <Rect width={SS_W} height={28} y={-SS_H / 2 + 14} fill={c.fg} opacity={0.3} radius={[8, 8, 0, 0]} />
      {/* Fake code lines */}
      <Layout layout direction="column" gap={8} y={10} x={-180}>
        {[0.6, 0.4, 0.75, 0.3, 0.55, 0.45, 0.7].map((w) => (
          <Rect width={SS_W * w * 0.5} height={7} radius={2} fill={c.fg} opacity={0.25} />
        ))}
      </Layout>
    </Rect>
  );
}

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  // --- BEAT 1: Show raw screenshot ---
  const ssRef = createRef<Rect>();
  const rawLabel = createRef<PillLabel>();

  view.add(
    <>
      {fakeScreenshot('gold', ssRef)}
      <PillLabel
        ref={rawLabel}
        text="Raw screenshot."
        accentColor={palette.gold.dark.fg}
        y={SS_H / 2 + 44}
        opacity={0}
      />
    </>,
  );

  yield* ssRef().scale(1.05, 0);
  yield* ssRef().scale(1, 0.5, easeOutCubic);
  yield* waitFor(0.3);
  yield* rawLabel().opacity(1, 0.4);
  yield* waitFor(0.8);
  yield* rawLabel().opacity(0, 0.3);

  // --- BEAT 2: SVG rectangle draws itself ---
  const tmpl = createRef<CropTemplate>();
  const tmplLabel = createRef<PillLabel>();

  view.add(
    <>
      <CropTemplate
        ref={tmpl}
        cropWidth={CROP_W}
        cropHeight={CROP_H}
        strokeColor={palette.turquoise.dark.fg}
      />
      <PillLabel
        ref={tmplLabel}
        text="One SVG. One rectangle."
        accentColor={palette.turquoise.dark.fg}
        y={SS_H / 2 + 44}
        opacity={0}
      />
    </>,
  );

  yield* tmpl().drawTemplate(1.2);
  yield* tmplLabel().opacity(1, 0.4);
  yield* waitFor(0.6);
  yield* tmplLabel().opacity(0, 0.3);

  // --- BEAT 3: Clip snap ---
  const outsideOverlay = createRef<Rect>();
  const clipLabel = createRef<PillLabel>();

  view.add(
    <>
      {/* Dim overlay — covers everything OUTSIDE the crop */}
      <Rect
        ref={outsideOverlay}
        width={1920}
        height={1080}
        fill={BASE.bg}
        opacity={0}
        // Clip hole: achieved by compositing — we fade in the overlay
        // and simultaneously clip the screenshot to the crop region
        zIndex={2}
      />
      <PillLabel
        ref={clipLabel}
        text="Same crop. Every time."
        accentColor={palette.jade.dark.fg}
        y={SS_H / 2 + 44}
        opacity={0}
        zIndex={3}
      />
    </>,
  );

  // Dim everything outside
  yield* outsideOverlay().opacity(0.88, 0.3, easeInOutCubic);

  // Apply actual clip to the screenshot
  yield* all(
    ssRef().width(CROP_W, 0.25, easeInOutCubic),
    ssRef().height(CROP_H, 0.25, easeInOutCubic),
    ssRef().radius(4, 0.25),
    tmpl().flashClip(0.25),
  );

  yield* outsideOverlay().opacity(0, 0.2);
  yield* clipLabel().opacity(1, 0.4);
  yield* waitFor(0.8);
  yield* clipLabel().opacity(0, 0.3);

  // --- BEAT 4: 15 more screenshots, accelerating rhythm ---
  // The template stays — no redraw. Each screenshot slides in, clips instantly.

  const grid: ReturnType<typeof createRef<Rect>>[] = [ssRef]; // ssRef is screenshot 1

  // Move first screenshot to grid position
  const GRID_COLS = 4;
  const GRID_ROWS = 4; // 16 total
  const THUMB_W = CROP_W * 0.38;
  const THUMB_H = CROP_H * 0.38;
  const GAP = 14;
  const GRID_TOTAL_W = GRID_COLS * (THUMB_W + GAP) - GAP;
  const GRID_TOTAL_H = GRID_ROWS * (THUMB_H + GAP) - GAP;
  const startX = -GRID_TOTAL_W / 2 + THUMB_W / 2;
  const startY = -GRID_TOTAL_H / 2 + THUMB_H / 2;

  // Shrink first screenshot into grid slot 0
  yield* all(
    ssRef().width(THUMB_W, 0.4, easeInOutCubic),
    ssRef().height(THUMB_H, 0.4, easeInOutCubic),
    ssRef().position.x(startX, 0.4, easeInOutCubic),
    ssRef().position.y(startY, 0.4, easeInOutCubic),
    tmpl().opacity(0, 0.3),
  );

  // All 16 gems in order: 8 dark + 8 light
  const allGems = [
    ...GEM_ORDER.map(g => ({ gem: g, mode: 'dark' as const })),
    ...GEM_ORDER.map(g => ({ gem: g, mode: 'light' as const })),
  ];

  // Duration per iteration — starts slow, accelerates to fast
  const getDur = (i: number) => Math.max(0.18, 0.7 - i * 0.04);

  for (let i = 1; i < 16; i++) {
    const { gem, mode } = allGems[i];
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const targetX = startX + col * (THUMB_W + GAP);
    const targetY = startY + row * (THUMB_H + GAP);
    const dur = getDur(i);

    const newRef = createRef<Rect>();
    grid.push(newRef);

    const c = palette[gem][mode];

    view.add(
      <Rect
        ref={newRef}
        width={THUMB_W}
        height={THUMB_H}
        radius={4}
        fill={c.bg}
        stroke={c.border}
        lineWidth={1}
        x={targetX + 200} // slide in from right
        y={targetY}
        opacity={0}
        clip
      >
        <Rect width={THUMB_W} height={10} y={-THUMB_H / 2 + 5} fill={c.fg} opacity={0.35} radius={[4, 4, 0, 0]} />
        <Layout layout direction="column" gap={4} y={6} x={-20}>
          {[0.6, 0.4, 0.7, 0.3].map((w) => (
            <Rect width={THUMB_W * w * 0.7} height={4} radius={1} fill={c.fg} opacity={0.2} />
          ))}
        </Layout>
      </Rect>,
    );

    yield* all(
      newRef().position.x(targetX, dur, easeOutCubic),
      newRef().opacity(1, dur * 0.6),
    );
  }

  yield* waitFor(0.4);

  // Final label
  const finalLabel = createRef<PillLabel>();
  view.add(
    <PillLabel
      ref={finalLabel}
      text="16 themes. One template. Zero manual work."
      accentColor={palette.turquoise.dark.fg}
      y={GRID_TOTAL_H / 2 + 48}
      opacity={0}
    />,
  );

  yield* finalLabel().opacity(1, 0.5);
  yield* waitFor(1.5);

  // Fade out
  yield* all(
    ...grid.map(r => r().opacity(0, 0.4)),
    finalLabel().opacity(0, 0.4),
  );
});