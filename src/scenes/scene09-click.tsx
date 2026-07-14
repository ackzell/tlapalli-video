import { makeScene2D, Layout, Circle } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  waitUntil,
  useDuration,
  tween,
  loop,
} from "@motion-canvas/core";
import { BASE, palette, GEM_ORDER } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { EditorWindow } from "../components/EditorWindow";
import { floatIt } from "../lib/floatIt";
import { addGroovyBackground } from "../lib/background";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  // --- Reveal all 8 windows in a 4×2 grid ---
  const COLS = 4;
  const WIN_W = 300;
  const WIN_H = 185;
  const WIN_TOTAL_H = WIN_H + 32; // include title bar
  const GAP_X = 18;
  const GAP_Y = 30;
  const TOTAL_W = COLS * WIN_W + (COLS - 1) * GAP_X;
  const startX = -TOTAL_W / 2 + WIN_W / 2;
  const rowOffsetY = WIN_TOTAL_H / 2 + GAP_Y / 2;

  const windowRefs = GEM_ORDER.map(() => createRef<EditorWindow>());
  const labelRef = createRef<PillLabel>();

  view.add(
    <>
      <Layout x={0} y={0}>
        {[...GEM_ORDER.reverse()].map((gem, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          return (
            <EditorWindow
              ref={windowRefs[i]}
              accentColor={palette[gem].dark.mid}
              bodyFill={palette[gem].dark.bg}
              placeholderBaseOpacity={0.6}
              label={``}
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

  yield* waitUntil("variations");

  const variationsDuration = useDuration("variations-duration");

  const windowDur = variationsDuration / 8;

  yield* sequence(
    windowDur,
    ...windowRefs.map((ref) =>
      all(ref().opacity(1, windowDur, easeOutCubic), ref().scale(1, windowDur, easeOutCubic)),
    ),
  );

  yield* waitUntil("one-tint");

  view.add(
    <PillLabel ref={labelRef} text="One tint. One codebase. Same focus." y={370} opacity={0} />,
  );

  yield* labelRef().opacity(1, 0.5);
  yield* waitFor(0.5);

  yield* waitUntil("it-wasnt");

  yield* all(...windowRefs.map((r) => r().opacity(0, 0.4)), labelRef().opacity(0, 0.4));
});
