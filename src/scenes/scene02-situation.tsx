import { makeScene2D, Circle, Img, Txt, Node, Layout } from "@motion-canvas/2d";
import ayu from "../images/tutorialkit-dark-modern.png";
import panda from "../images/amoxtli-dark-modern.png";
import moonlight from "../images/ec-plugins-dark-modern.png";

import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  waitUntil,
  useDuration,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { addGroovyBackground } from "../lib/background";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const imageData = [
    { src: ayu, x: -360, role: "backend" },
    { src: panda, x: 0, role: "frontend" },
    { src: moonlight, x: 360, role: "lib" },
  ];
  const baseImageOpacity = 0.55;

  const imageRefs = imageData.map(() => createRef<Img>());
  const imageTitleRefs = imageData.map(() => createRef<Txt>());
  const cursorRef = createRef<Circle>();
  const label1 = createRef<PillLabel>();
  const label2 = createRef<PillLabel>();

  // view.fill(BASE.border);

  view.add(
    <>
      {imageData.map((img, i) => (
        <Node>
          <Img
            ref={imageRefs[i]}
            src={img.src}
            width={320}
            x={img.x}
            y={-20}
            opacity={0}
            scale={0.92}
          />
          <Txt
            ref={imageTitleRefs[i]}
            text={img.role}
            x={img.x}
            y={-145}
            fontSize={25}
            fill={BASE.textMid}
            fontFamily={BASE.titleFont}
            opacity={0}
          />
        </Node>
      ))}

      <Circle
        ref={cursorRef}
        size={14}
        fill={BASE.textMid}
        x={-360}
        y={-20}
        opacity={0}
        zIndex={10}
      />

      <Layout layout direction={"column"} y={230}>
        <PillLabel
          ref={label1}
          text="Switching context has a cost."
          accentColor={palette.gold.dark.fg}
          opacity={0}
        />
        <PillLabel
          ref={label2}
          text="Not just in time. In mental energy."
          accentColor={palette.quartz.dark.fg}
          opacity={0}
        />
      </Layout>
    </>,
  );

  yield* sequence(
    1.5,
    ...imageRefs.map((ref, idx) =>
      all(ref().opacity(baseImageOpacity, 0.5, easeOutCubic), ref().scale(1, 0.5, easeOutCubic)),
    ),
  );

  yield* waitUntil("backend");
  yield* imageTitleRefs[0]().opacity(1, 0.5, easeOutCubic);
  yield* imageRefs[0]().opacity(1, 0.3);

  yield* waitUntil("frontend");
  yield* imageTitleRefs[1]().opacity(1, 0.5, easeOutCubic);
  yield* imageRefs[1]().opacity(1, 0.3);

  yield* waitUntil("lib");
  yield* imageTitleRefs[2]().opacity(1, 0.5, easeOutCubic);
  yield* imageRefs[2]().opacity(1, 0.3);

  yield* waitFor(0.3);

  yield* all(...imageRefs.map((ref) => ref().opacity(baseImageOpacity, 0.5, easeInOutCubic)));

  yield* waitUntil("one-thing-i-learned");
  yield* cursorRef().opacity(1, 0.3);

  const differentContextsDuration = useDuration("different-contexts");
  const hoverOrder = [0, 1, 2, 0, 2];

  const stepDuration = differentContextsDuration / hoverOrder.length;

  for (const targetIndex of hoverOrder) {
    const targetX = imageData[targetIndex].x;

    yield* all(
      cursorRef().position.x(targetX, stepDuration, easeInOutCubic),
      ...imageRefs.map((ref, idx) =>
        ref().opacity(
          idx === targetIndex ? 1 : baseImageOpacity,
          stepDuration * 0.5,
          easeInOutCubic,
        ),
      ),
    );
  }

  yield* waitUntil("context-switch");

  yield* cursorRef().opacity(0, 0.2);
  yield* all(...imageRefs.map((ref) => ref().opacity(1, 0.4)));
  yield* label1().opacity(1, 0.5);

  yield* waitUntil("mental-energy");

  yield* label2().opacity(1, 0.5);
  yield* waitFor(1.2);

  yield* all(label1().opacity(0, 0.3), label2().opacity(0, 0.3));

  yield* all(
    ...imageRefs.map((r) => r().opacity(0, 0.4)),
    ...imageTitleRefs.map((r) => r().opacity(0, 0.4)),
  );
});
