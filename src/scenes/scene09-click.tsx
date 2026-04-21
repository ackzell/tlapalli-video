import { makeScene2D, Layout, Circle } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  sequence,
} from "@motion-canvas/core";
import { BASE, palette, GEM_ORDER } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { EditorWindow } from "../components/EditorWindow";

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  // --- Two windows stacked: obsidian (greyscale) fades out, gold fades in ---
  // No color math — just a crossfade between two fully-formed windows.
  const obsidianWin = createRef<EditorWindow>();
  const goldWin = createRef<EditorWindow>();

  view.add(
    <>
      {/* Gold window underneath, invisible at first */}
      <EditorWindow
        ref={goldWin}
        accentColor={palette.gold.dark.mid}
        bodyFill={palette.gold.dark.bg}
        label="repo/"
        winWidth={560}
        winHeight={340}
        placeholderBaseOpacity={0.24}
        opacity={0}
      />
      {/* Obsidian window on top */}
      <EditorWindow
        ref={obsidianWin}
        accentColor={BASE.textMid}
        bodyFill={BASE.surface}
        label="repo/"
        winWidth={560}
        winHeight={340}
        placeholderBaseOpacity={0.24}
        opacity={0}
        scale={0.86}
      />
    </>,
  );

  yield* waitFor(0.5);

  yield* all(
    obsidianWin().opacity(1, 0.6, easeInOutCubic),
    obsidianWin().scale(1, 0.6, easeInOutCubic),
  );

  // Crossfade: obsidian out, gold in — slow and deliberate, like light through a gem
  yield* all(
    obsidianWin().opacity(0, 1.2, easeInOutCubic),
    goldWin().opacity(1, 1.2, easeInOutCubic),
  );

  yield* waitFor(0.4);

  // Shrink both together (they're in the same position)
  yield* all(
    obsidianWin().position.x(-520, 0.6, easeInOutCubic),
    obsidianWin().scale(0.52, 0.6, easeInOutCubic),
    goldWin().position.x(-520, 0.6, easeInOutCubic),
    goldWin().scale(0.52, 0.6, easeInOutCubic),
  );

  // --- Reveal all 8 windows in a 4×2 grid ---
  const COLS = 4;
  const WIN_W = 300;
  const WIN_H = 185;
  const WIN_TOTAL_H = WIN_H + 32; // include title bar
  const GAP_X = 18;
  const GAP_Y = 18;
  const TOTAL_W = COLS * WIN_W + (COLS - 1) * GAP_X;
  const startX = -TOTAL_W / 2 + WIN_W / 2;
  const rowOffsetY = WIN_TOTAL_H / 2 + GAP_Y / 2;

  const windowRefs = GEM_ORDER.map(() => createRef<EditorWindow>());
  const logoRef = createRef<Layout>();
  const gemDots = GEM_ORDER.map(() => createRef<Circle>());

  view.add(
    <>
      <Layout x={0} y={0}>
        {GEM_ORDER.map((gem, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          return (
            <EditorWindow
              ref={windowRefs[i]}
              accentColor={palette[gem].dark.mid}
              bodyFill={palette[gem].dark.bg}
              placeholderBaseOpacity={0.24}
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

      {/* Logo dots — appear at the end */}
      <Layout ref={logoRef} y={270} gap={10} opacity={0}>
        {GEM_ORDER.map((gem, i) => (
          <Circle
            ref={gemDots[i]}
            size={10}
            fill={palette[gem].dark.fg}
            shadowColor={palette[gem].dark.fg}
            shadowBlur={8}
          />
        ))}
      </Layout>
    </>,
  );

  // Fade out the two hero windows
  yield* all(obsidianWin().opacity(0, 0.3), goldWin().opacity(0, 0.3));

  // Stagger the 8 gem windows in
  yield* sequence(
    0.07,
    ...windowRefs.map((ref) =>
      all(ref().opacity(1, 0.45, easeOutCubic), ref().scale(1, 0.45, easeOutCubic)),
    ),
  );

  yield* waitFor(0.3);

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

  // Logo dots — quiet, satisfying
  yield* logoRef().opacity(1, 0.6, easeInOutCubic);
  yield* waitFor(1.2);

  yield* all(
    ...windowRefs.map((r) => r().opacity(0, 0.4)),
    labelRef().opacity(0, 0.4),
    logoRef().opacity(0, 0.4),
  );
});
