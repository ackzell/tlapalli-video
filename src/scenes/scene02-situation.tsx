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
  chain,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const imageData = [
    { src: ayu, x: -360, role: "backend" },
    { src: panda, x: 0, role: "frontend" },
    { src: moonlight, x: 360, role: "lib" },
  ];
  const baseImageOpacity = 0.4;

  const imageRefs = imageData.map(() => createRef<Img>());
  const imageTitleRefs = imageData.map(() => createRef<Txt>());
  const cursorRef = createRef<Circle>();
  const label1 = createRef<PillLabel>();
  const label2 = createRef<PillLabel>();

  view.add(
    <>
      {imageData.map((img, i) => (
        <Node>
          <Img
            ref={imageRefs[i]}
            src={img.src}
            width={320}
            radius={10}
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
            fontSize={11}
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
          text="Context switching has a cost."
          accentColor={palette.gold.dark.fg}
          opacity={0}
        />
        <PillLabel
          ref={label2}
          text="Not just time. Mental energy."
          accentColor={palette.quartz.dark.fg}
          opacity={0}
        />
      </Layout>
    </>,
  );

  yield* sequence(
    0.15,
    ...imageRefs.map((ref, idx) =>
      all(
        ref().opacity(baseImageOpacity, 0.5, easeOutCubic),
        ref().scale(1, 0.5, easeOutCubic),
        imageTitleRefs[idx]().opacity(0.85, 0.5, easeOutCubic),
      ),
    ),
  );

  yield* waitFor(0.3);
  yield* cursorRef().opacity(1, 0.3);

  const hoverOrder = [0, 1, 2, 0, 2];
  for (const targetIndex of hoverOrder) {
    const targetX = imageData[targetIndex].x;

    yield* cursorRef().position.x(targetX, 0.3, easeInOutCubic);
    yield* all(
      ...imageRefs.map((ref, idx) =>
        ref().opacity(idx === targetIndex ? 1 : baseImageOpacity, 0.16, easeInOutCubic),
      ),
    );
    yield* chain(
      cursorRef().position.x(targetX + 6, 0.05),
      cursorRef().position.x(targetX - 6, 0.05),
      cursorRef().position.x(targetX, 0.05),
    );
    yield* waitFor(0.2);
  }

  yield* cursorRef().opacity(0, 0.2);

  yield* label1().opacity(1, 0.5);
  yield* waitFor(0.2);
  yield* label2().opacity(1, 0.5);
  yield* waitFor(1.2);

  yield* all(label1().opacity(0, 0.3), label2().opacity(0, 0.3));

  yield* all(
    ...imageRefs.map((r) => r().opacity(0, 0.4)),
    ...imageTitleRefs.map((r) => r().opacity(0, 0.4)),
  );
});
