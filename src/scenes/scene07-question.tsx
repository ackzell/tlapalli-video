import { makeScene2D, Rect, Txt, Circle } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  loop,
  cancel,
  useDuration,
  waitUntil,
  sequence,
  chain,
  easeInCubic,
  linear,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { addGroovyBackground } from "../lib/background";

const QUESTION = "How hard would it be to 'just' build my own theme?";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const questionMarkRef = createRef<Txt>();

  const questionRef = createRef<Txt>();
  const cursorRef = createRef<Rect>();
  const rabbitLabel = createRef<PillLabel>();
  const holeRef = createRef<Rect>();

  view.add(
    <>
      <Txt
        ref={questionMarkRef}
        text="?"
        fontSize={22}
        fill={BASE.textMid}
        fontFamily={BASE.mono}
        textAlign="center"
        opacity={0}
        scale={1}
      />

      <Txt
        ref={questionRef}
        text=""
        fontSize={44}
        fill={BASE.textMid}
        fontFamily={BASE.mono}
        textAlign="center"
      />

      {/* Blinking cursor */}
      <Rect
        ref={cursorRef}
        width={24}
        height={44}
        fill={BASE.textMid}
        x={0} // will be positioned after text appears
        opacity={0}
      />

      {/* Rabbit hole — a dark oval */}
      <Rect ref={holeRef} width={60} height={16} radius={8} fill="#3e3030" y={80} opacity={0} />

      <PillLabel
        ref={rabbitLabel}
        text="Rabbit hole."
        accentColor={palette.gold.dark.fg}
        y={140}
        opacity={0}
      />
    </>,
  );

  yield* waitUntil("question-mark");
  const dur = useDuration("one-question");

  yield* all(
    questionMarkRef().scale(20, dur, easeInOutCubic),
    questionMarkRef().opacity(1, dur, easeInOutCubic),
  );

  // Typewriter effect — append characters one by one
  // Wait for the audio cue that marks when typing should start
  yield* waitUntil("question-start");

  yield* questionMarkRef().opacity(0, 0.4, easeInOutCubic);

  // // useDuration measures the gap between 'question-start' and 'question-end'
  // // — drag those two markers in the editor to match your voiceover.
  // // The per-character delay is computed so typing fills exactly that window.
  // const charDelay = typingDuration / QUESTION.length;

  // for (let i = 1; i <= QUESTION.length; i++) {
  //   questionRef().text(QUESTION.slice(0, i));
  //   yield* waitFor(charDelay);
  // }

  // // Position cursor at end of text and start blinking
  const textWidth = QUESTION.length * 26.8; // approx monospace char width at fontSize 44

  const typingDuration = useDuration("question-typing");
  yield* questionRef().text(QUESTION, typingDuration, linear);

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

  yield* waitUntil("rabbit-hole");
  yield* rabbitLabel().opacity(1, 0.5);

  yield* waitFor(1.5);

  yield* rabbitLabel().opacity(0, 0.4);
});
