import { makeScene2D, Line, Txt, Layout } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutBack,
  sequence,
} from "@motion-canvas/core";
import { BASE, GemName, palette } from "../styles/palette";
import { TimelineDot } from "../components/TimelineDot";
import { PillLabel } from "../components/PillLabel";

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
  view.fill(BASE.bg);

  const timelineRef = createRef<Line>();
  const dotRefs = EVENTS.map(() => createRef<TimelineDot>());
  const reflectionRefs = [createRef<Txt>(), createRef<Txt>()];

  view.add(
    <>
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
      <Layout layout direction={"column"} y={160}>
        <PillLabel
          ref={reflectionRefs[0]}
          text={"It wasn't a moment of inspiration."}
          opacity={0}
        />

        <PillLabel ref={reflectionRefs[1]} text={"It was iteration. Friction."} opacity={0} />
      </Layout>
    </>,
  );

  // Draw the line
  yield* timelineRef().end(1, 1.2, easeInOutCubic);

  // Stagger dots in
  yield* sequence(0.15, ...dotRefs.map((ref) => ref().scale(1, 0.35, easeOutBack)));

  yield* waitFor(0.4);

  // Reflection text
  yield* sequence(
    1.2,
    reflectionRefs[0]().opacity(1, 0.7, easeInOutCubic),
    reflectionRefs[1]().opacity(1, 0.7, easeInOutCubic),
  );

  yield* waitFor(2);

  // Fade out
  yield* all(
    timelineRef().opacity(0, 0.5),
    ...dotRefs.map((r) => r().opacity(0, 0.5)),
    ...reflectionRefs.map((r) => r().opacity(0, 0.5)),
  );
});
