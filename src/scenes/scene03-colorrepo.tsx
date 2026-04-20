import { makeScene2D, Txt, Line, Img, Node } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, easeOutCubic, sequence,
} from '@motion-canvas/core';
import { BASE, palette } from '../styles/palette';
import { PillLabel } from '../components/PillLabel';

import tutorialkitDark from '../images/tutorialkit-dark-modern.png';
import amoxtliDark from '../images/amoxtli-dark-modern.png';
import ecPluginsDark from '../images/ec-plugins-dark-modern.png';

import tutorialkitAyu from '../images/tutorialkit-ayu.png';
import amoxtliPanda from '../images/amoxtli-panda.png';
import ecPluginsMoonlight from '../images/ec-plugins-moonlight.png';

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const beforeImages = [
    {src: tutorialkitDark, name: 'backend'},
    {src: amoxtliDark, name: 'frontend'},
    {src: ecPluginsDark, name: 'lib'},
  ];
  const afterImages = [
    {src: tutorialkitAyu, name: 'backend'},
    {src: amoxtliPanda, name: 'frontend'},
    {src: ecPluginsMoonlight, name: 'lib'},
  ];

  const beforeRefs = beforeImages.map(() => createRef<Img>());
  const afterRefs = afterImages.map(() => createRef<Img>());
  const beforeLabelRefs = beforeImages.map(() => createRef<Txt>());
  const afterLabelRefs = afterImages.map(() => createRef<Txt>());

  const imgWidth = 200;
  const xs = [-270, 0, 270];
  const baseImageOpacity = 1;

  const divider = createRef<Line>();
  const beforeLabel = createRef<Txt>();
  const afterLabel  = createRef<Txt>();
  const pill = createRef<PillLabel>();

  view.add(
    <>
      {/* BEFORE images — left half */}
      {beforeImages.map((img, i) => (
        <Node key={`before-${img.name}-${i}`} x={-490 + xs[i]}>
          <Txt
            ref={beforeLabelRefs[i]}
            text={img.name}
            y={-105}
            fontSize={16}
            fill={BASE.text}
            fontFamily={BASE.font}
            opacity={0}
          />
          <Img
            ref={beforeRefs[i]}
            src={img.src}
            width={imgWidth}
            radius={8}
            opacity={0}
          />
        </Node>
      ))}

      {/* AFTER images — right half */}
      {afterImages.map((img, i) => (
        <Node key={`after-${img.name}-${i}`} x={490 + xs[i]}>
          <Txt
            ref={afterLabelRefs[i]}
            text={img.name}
            y={-105}
            fontSize={16}
            fill={BASE.textMid}
            fontFamily={BASE.font}
            opacity={0}
          />
          <Img
            ref={afterRefs[i]}
            src={img.src}
            width={imgWidth}
            radius={8}
            opacity={0}
          />
        </Node>
      ))}

      {/* Vertical divider */}
      <Line
        ref={divider}
        points={[[0, -220], [0, 220]]}
        stroke={BASE.border}
        lineWidth={1}
        end={0}
      />

      <Txt
        ref={beforeLabel}
        text="before"
        fontSize={12}
        fill={BASE.text}
        fontFamily={BASE.font}
        
        x={-490}
        y={-180}
        opacity={0}
      />
      <Txt
        ref={afterLabel}
        text="after"
        fontSize={12}
        fill={BASE.textMid}
        fontFamily={BASE.font}

        x={490}
        y={-180}
        opacity={0}
      />

      <PillLabel
        ref={pill}
        text="One color. One repo. One context."
        accentColor={palette.turquoise.dark.fg}
        y={180}
        opacity={0}
      />
    </>,
  );

  // Before side appears
  yield* sequence(0.1, ...beforeRefs.map((r, i) => all(
    r().opacity(baseImageOpacity, 0.4),
    beforeLabelRefs[i]().opacity(0.85, 0.4),
  )));
  yield* beforeLabel().opacity(1, 0.3);

  // Divider draws
  yield* divider().end(1, 0.4, easeInOutCubic);

  // After side appears — themed
  yield* sequence(0.1, ...afterRefs.map((r, i) => all(
    r().opacity(1, 0.4),
    afterLabelRefs[i]().opacity(0.85, 0.4),
  )));
  yield* afterLabel().opacity(1, 0.3);

  yield* waitFor(0.5);
  yield* pill().opacity(1, 0.5);
  yield* waitFor(1.5);

  yield* all(
    ...beforeRefs.map(r => r().opacity(0, 0.4)),
    ...afterRefs.map(r => r().opacity(0, 0.4)),
    ...beforeLabelRefs.map(r => r().opacity(0, 0.4)),
    ...afterLabelRefs.map(r => r().opacity(0, 0.4)),
    divider().opacity(0, 0.4),
    beforeLabel().opacity(0, 0.3),
    afterLabel().opacity(0, 0.3),
    pill().opacity(0, 0.4),
  );
});