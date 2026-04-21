import { makeScene2D, Rect, Txt, Circle } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  loop,
  cancel,
  ThreadGenerator,
  tween,
  map,
  easeOutCubic,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";

const QUESTION = "How hard would it be to build my own theme?";

export default makeScene2D(function* (view) {
  // Subtle warm shift toward gold
  view.fill(palette.gold.dark.bg);

  const questionRef = createRef<Txt>();
  const cursorRef = createRef<Rect>();
  const rabbitLabel = createRef<PillLabel>();
  const holeRef = createRef<Rect>();

  view.add(
    <>
      <Txt
        ref={questionRef}
        text=""
        fontSize={22}
        fill={BASE.textMid}
        fontFamily={BASE.mono}
        textAlign="center"
      />

      {/* Blinking cursor */}
      <Rect
        ref={cursorRef}
        width={12}
        height={22}
        fill={BASE.textMid}
        x={0} // will be positioned after text appears
        opacity={0}
      />

      {/* Rabbit hole — a dark oval */}
      <Rect ref={holeRef} width={60} height={16} radius={8} fill="#000000" y={80} opacity={0} />

      <PillLabel
        ref={rabbitLabel}
        text="Rabbit hole."
        accentColor={palette.gold.dark.fg}
        y={140}
        opacity={0}
      />
    </>,
  );

  // Typewriter effect — append characters one by one
  for (let i = 1; i <= QUESTION.length; i++) {
    questionRef().text(QUESTION.slice(0, i));
    yield* waitFor(0.038);
  }

  // Position cursor at end of text and start blinking
  const textWidth = QUESTION.length * 13.4; // approx monospace char width at fontSize 22
  cursorRef().x(textWidth / 2 + 4);
  cursorRef().opacity(1);

  // Blink loop
  const blinkTask = yield loop(Infinity, function* () {
    yield* cursorRef().opacity(0, 0.5);
    yield* cursorRef().opacity(1, 0.5);
  });

  yield* waitFor(1.2);

  // Stop blinking
  cancel(blinkTask);
  yield* cursorRef().opacity(0, 0.15);

  // Hole appears
  yield* holeRef().opacity(1, 0.3);

  // Question shrinks and dives into hole
  yield* all(
    questionRef().scale(0.1, 0.5, easeInOutCubic),
    questionRef().position.y(80, 0.5, easeInOutCubic),
    questionRef().opacity(0, 0.5),
  );

  yield* holeRef().opacity(0, 0.2);
  yield* waitFor(0.2);

  yield* rabbitLabel().opacity(1, 0.5);
  yield* waitFor(1.5);

  yield* rabbitLabel().opacity(0, 0.4);
});
