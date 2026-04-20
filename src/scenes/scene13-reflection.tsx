import { makeScene2D, Line, Txt, Layout } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, easeOutBack, sequence,
} from '@motion-canvas/core';
import { BASE, palette } from '../styles/palette';
import { TimelineDot } from '../components/TimelineDot';
import { PillLabel } from '../components/PillLabel';

const EVENTS = [
  { label: 'found the\ntheme',    color: BASE.text },
  { label: 'manual\nfixes',       color: BASE.text },
  { label: 'the\nquestion',       color: palette.gold.dark.fg },
  { label: 'first\nscripts',      color: palette.gold.dark.mid },
  { label: 'first\ntint',         color: palette.turquoise.dark.fg },
  { label: 'Tlapalli',            color: palette.jade.dark.fg },
] as const;

const LINE_W = 780;
const DOT_SPACING = LINE_W / (EVENTS.length - 1);

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const timelineRef = createRef<Line>();
  const dotRefs = EVENTS.map(() => createRef<TimelineDot>());
  const reflectionRef = createRef<Txt>();

  view.add(
    <>
      {/* Timeline line */}
      <Line
        ref={timelineRef}
        points={[
          [-LINE_W / 2, 0],
          [ LINE_W / 2, 0],
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
          dotColor={e.color}
          label={e.label}
          labelBelow={i % 2 === 0}
          x={-LINE_W / 2 + i * DOT_SPACING}
          y={0}
          scale={0}
        />
      ))}

      {/* Reflection text */}
      <Txt
        ref={reflectionRef}
        text={'It wasn\'t a moment of inspiration.\nIt was iteration. Friction.'}
        fontSize={18}
        fill={BASE.textMid}
        fontFamily={BASE.font}
        textAlign="center"
        lineHeight={30}
        y={160}
        opacity={0}
      />
    </>,
  );

  // Draw the line
  yield* timelineRef().end(1, 1.2, easeInOutCubic);

  // Stagger dots in
  yield* sequence(
    0.15,
    ...dotRefs.map(ref =>
      ref().scale(1, 0.35, easeOutBack),
    ),
  );

  yield* waitFor(0.4);

  // Reflection text
  yield* reflectionRef().opacity(1, 0.7, easeInOutCubic);

  yield* waitFor(2);

  // Fade out
  yield* all(
    timelineRef().opacity(0, 0.5),
    ...dotRefs.map(r => r().opacity(0, 0.5)),
    reflectionRef().opacity(0, 0.5),
  );
});