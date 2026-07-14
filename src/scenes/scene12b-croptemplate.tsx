import { makeScene2D, Rect, Img } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  waitUntil,
  useDuration,
} from "@motion-canvas/core";
import { BASE, palette, GEM_ORDER } from "../styles/palette";
import { CropTemplate } from "../components/CropTemplate";
import { PillLabel } from "../components/PillLabel";

import fullWindow from "../images/screenshots/fullWindow.png";
import obsidianDark from "../images/screenshots/obsidianDark.png";
import obsidianLight from "../images/screenshots/obsidianLight.png";
import goldDark from "../images/screenshots/goldDark.png";
import goldLight from "../images/screenshots/goldLight.png";
import turquoiseDark from "../images/screenshots/turquoiseDark.png";
import turquoiseLight from "../images/screenshots/turquoiseLight.png";
import quartzDark from "../images/screenshots/quartzDark.png";
import quartzLight from "../images/screenshots/quartzLight.png";
import lapisLazuliDark from "../images/screenshots/lapisLazuliDark.png";
import lapisLazuliLight from "../images/screenshots/lapisLazuliLight.png";
import amethystDark from "../images/screenshots/amethystDark.png";
import amethystLight from "../images/screenshots/amethystLight.png";
import jadeDark from "../images/screenshots/jadeDark.png";
import jadeLight from "../images/screenshots/jadeLight.png";
import fireOpalDark from "../images/screenshots/fireOpalDark.png";
import fireOpalLight from "../images/screenshots/fireOpalLight.png";
import { addGroovyBackground } from "../lib/background";

const SCREENSHOTS: Record<string, string> = {
  obsidianDark,
  obsidianLight,
  goldDark,
  goldLight,
  turquoiseDark,
  turquoiseLight,
  quartzDark,
  quartzLight,
  lapisLazuliDark,
  lapisLazuliLight,
  amethystDark,
  amethystLight,
  jadeDark,
  jadeLight,
  fireOpalDark,
  fireOpalLight,
};

// Full-window display dimensions (Beat 1)
const FW_W = 3456 * 0.35;
const FW_H = 2170 * 0.35;
// Crop region display dimensions (matches variant screenshots)
const CROP_W = 2167 * 0.35;
const CROP_H = 709 * 0.35;
const CROP_X = -225.5;
const CROP_Y = -34;

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  // --- BEAT 1: Show raw screenshot ---
  const fwRef = createRef<Img>();
  const cropPreviewRef = createRef<Rect>();
  const ssRef = createRef<Img>();
  const rawLabel = createRef<PillLabel>();

  view.add(
    <>
      {/* Full window — shown in Beat 1, fades out at clip snap */}
      <Img ref={fwRef} src={fullWindow} width={FW_W} clip opacity={1} />
      {/* Real clip preview of the full screenshot, aligned to the crop region */}
      <Rect
        ref={cropPreviewRef}
        width={CROP_W}
        height={CROP_H}
        clip
        x={CROP_X}
        y={CROP_Y}
        opacity={0}
      >
        <Img src={fullWindow} width={FW_W} x={-CROP_X} y={-CROP_Y} />
      </Rect>
      {/* Cropped variant — hidden until clip snap, then moves to grid slot 0 */}
      <Img
        ref={ssRef}
        src={obsidianDark}
        width={CROP_W}
        height={CROP_H}
        clip
        opacity={0}
        x={CROP_X}
        y={CROP_Y}
      />
      <PillLabel
        ref={rawLabel}
        text="Raw screenshot."
        accentColor={palette.gold.dark.fg}
        y={FW_H / 2 + 44}
        opacity={0}
      />
    </>,
  );

  const scaleDuration = useDuration("screenshot-intro");

  yield* fwRef().scale(1.05, 0);
  yield* fwRef().scale(1, scaleDuration, easeOutCubic);
  yield* rawLabel().opacity(1, 0.4);
  yield* waitFor(0.8);
  yield* rawLabel().opacity(0, 0.3);

  yield* waitUntil("show-crop");

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
        x={CROP_X}
        y={CROP_Y}
        fill="#3d7f7d55"
      />
      <PillLabel
        ref={tmplLabel}
        text="One SVG. One rectangle."
        accentColor={palette.turquoise.dark.fg}
        y={FW_H / 2 + 44}
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
      <PillLabel
        ref={clipLabel}
        text="Same crop. Every time."
        accentColor={palette.jade.dark.fg}
        y={CROP_H / 2 + 44}
        opacity={0}
        zIndex={3}
      />
    </>,
  );

  // Dim everything outside the crop region
  yield* fwRef().opacity(0.88, 0.3, easeInOutCubic);

  // Flash + clip: reveal the actual clipped full screenshot first, then hand off
  // to the pre-cropped asset so the crop action still reads on screen.
  yield* all(
    tmpl().flashClip(0.25),
    cropPreviewRef().opacity(1, 0.12),
    fwRef().opacity(0.18, 0.12),
  );

  yield* all(cropPreviewRef().opacity(0, 0.16), fwRef().opacity(0, 0.16), ssRef().opacity(1, 0.16));

  yield* fwRef().opacity(0, 0.2);
  yield* clipLabel().opacity(1, 0.4);
  yield* waitFor(0.8);
  yield* clipLabel().opacity(0, 0.3);

  // --- BEAT 4: 15 more screenshots, accelerating rhythm ---
  const GRID_COLS = 4;
  const GRID_ROWS = 4;
  const THUMB_W = CROP_W * 0.38;
  const THUMB_H = CROP_H * 0.38;
  const GAP = 14;
  const GRID_TOTAL_W = GRID_COLS * (THUMB_W + GAP) - GAP;
  const GRID_TOTAL_H = GRID_ROWS * (THUMB_H + GAP) - GAP;
  const startX = -GRID_TOTAL_W / 2 + THUMB_W / 2;
  const startY = -GRID_TOTAL_H / 2 + THUMB_H / 2;

  // grid[0] = ssRef (obsidianDark, already shown)
  const grid: ReturnType<typeof createRef<Img>>[] = [ssRef];

  // Shrink first screenshot into grid slot 0
  yield* all(
    ssRef().width(THUMB_W, 0.4, easeInOutCubic),
    ssRef().height(THUMB_H, 0.4, easeInOutCubic),
    ssRef().position.x(startX, 0.4, easeInOutCubic),
    ssRef().position.y(startY, 0.4, easeInOutCubic),
    tmpl().opacity(0, 0.3),
  );

  // 8 dark + 8 light, grid[0] = obsidianDark so start loop from index 1
  const allGems = [
    ...GEM_ORDER.map((g) => ({ gem: g, mode: "dark" as const })),
    ...GEM_ORDER.map((g) => ({ gem: g, mode: "light" as const })),
  ];

  const getDur = (i: number) => Math.max(0.18, 0.7 - i * 0.04);

  for (let i = 1; i < 16; i++) {
    const { gem, mode } = allGems[i];
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const targetX = startX + col * (THUMB_W + GAP);
    const targetY = startY + row * (THUMB_H + GAP);
    const dur = getDur(i);

    const newRef = createRef<Img>();
    grid.push(newRef);

    const key = `${gem}${mode.charAt(0).toUpperCase() + mode.slice(1)}`;

    view.add(
      <Img
        ref={newRef}
        src={SCREENSHOTS[key]}
        width={THUMB_W}
        height={THUMB_H}
        clip
        x={targetX + 200}
        y={targetY}
        opacity={0}
      />,
    );

    yield* all(newRef().position.x(targetX, dur, easeOutCubic), newRef().opacity(1, dur * 0.6));
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
  yield* all(...grid.map((r) => r().opacity(0, 0.4)), finalLabel().opacity(0, 0.4));
});
