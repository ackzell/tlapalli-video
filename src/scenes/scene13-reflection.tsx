import { makeScene2D, Line, Txt, Layout } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutBack,
  sequence,
  waitUntil,
  useDuration,
} from "@motion-canvas/core";
import { BASE, GemName, palette } from "../styles/palette";
import { TimelineDot } from "../components/TimelineDot";
import { PillLabel } from "../components/PillLabel";
import { FixedCamera } from "../components/FixedCamera";
import { addGroovyBackground } from "../lib/background";

const EVENTS: { label: string; gem: GemName }[] = [
  { label: "found the\ntheme", gem: "obsidian" },
  { label: "manual\nfixes", gem: "gold" },
  { label: "the\nquestion", gem: "turquoise" },
  { label: "first\ntint", gem: "quartz" },
  { label: "first\nscripts", gem: "lapisLazuli" },
  { label: "Tlapalli", gem: "amethyst" },
] as const;

const LINE_W = 780;
const DOT_SPACING = LINE_W / (EVENTS.length - 1);

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const timelineRef = createRef<Line>();
  const dotRefs = EVENTS.map(() => createRef<TimelineDot>());
  const reflectionRefs = [createRef<Txt>(), createRef<Txt>()];

  const cameraRef = createRef<FixedCamera>();

  view.add(
    <FixedCamera ref={cameraRef}>
      {/* Timeline line */}
      <Line
        ref={timelineRef}
        points={[
          [-LINE_W / 2, 0],
          [LINE_W / 2, 0],
        ]}
        stroke={BASE.border}
        lineWidth={2}
        lineCap="round"
        end={0}
        y={0}
      />

      {/* Dots */}
      {EVENTS.map((e, i) => (
        <TimelineDot
          ref={dotRefs[i]}
          gemColor={e.gem}
          label={e.label}
          labelBelow={i % 2 === 0}
          x={-LINE_W / 2 + i * DOT_SPACING}
          y={0}
          scale={0}
        />
      ))}

      {/* Reflection text */}
      <Layout layout direction={"column"} y={280}>
        <PillLabel
          ref={reflectionRefs[0]}
          text={"It wasn't a moment of inspiration."}
          opacity={0}
        />

        <PillLabel ref={reflectionRefs[1]} text={"It was iteration. Friction."} opacity={0} />
      </Layout>
    </FixedCamera>,
  );

  // Draw the line
  yield* timelineRef().end(1, 1.2, easeInOutCubic);

  yield* waitUntil("inspiration");
  yield* reflectionRefs[0]().opacity(1, 0.7, easeInOutCubic);

  yield* waitUntil("iteration");
  yield* reflectionRefs[1]().opacity(1, 0.7, easeInOutCubic);

  yield* all(...reflectionRefs.map((r) => r().opacity(0, 0.5)));

  const dotsDuration = useDuration("dots");
  const eachDot = dotsDuration / dotRefs.length;

  // Stagger dots in, zoom and follow each dot
  for (let i = 0; i < dotRefs.length; i++) {
    // Center camera on the dot and zoom in
    yield* all(
      cameraRef().centerOn(dotRefs[i](), 0.35, easeInOutCubic),
      cameraRef().zoom(1.7, 0.4, easeInOutCubic),
      dotRefs[i]().scale(1, 0.35, easeOutBack),
    );
    // Wait for the rest of the interval if any
    if (eachDot > 0.35) yield* waitFor(eachDot - 0.35);
  }
  // Optionally, zoom out and center camera after all dots
  yield* all(
    cameraRef().centerOn(0, 0.7, easeInOutCubic),
    cameraRef().zoom(1, 0.7, easeInOutCubic),
  );

  yield* waitUntil("outro");
  // Fade out
  yield* sequence(
    0.12,
    timelineRef().opacity(0, 0.5),
    all(...dotRefs.map((r) => r().opacity(0, 0.5)), ...dotRefs.map((r) => r().scale(0, 0.5))),
  );
});
