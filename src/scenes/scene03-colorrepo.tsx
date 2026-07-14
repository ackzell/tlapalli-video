import { makeScene2D, Txt, Line, Img, Node, Layout, Camera } from "@motion-canvas/2d";
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

import tutorialkitDark from "../images/tutorialkit-dark-modern.png";
import amoxtliDark from "../images/amoxtli-dark-modern.png";
import ecPluginsDark from "../images/ec-plugins-dark-modern.png";

import tutorialkitAyu from "../images/tutorialkit-ayu.png";
import amoxtliPanda from "../images/amoxtli-panda.png";
import ecPluginsMoonlight from "../images/ec-plugins-moonlight.png";
import { FixedCamera } from "../components/FixedCamera";
import { addGroovyBackground } from "../lib/background";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const beforeImages = [
    { src: tutorialkitDark, name: "backend" },
    { src: amoxtliDark, name: "frontend" },
    { src: ecPluginsDark, name: "lib" },
  ];
  const afterImages = [
    { src: tutorialkitAyu, name: "backend" },
    { src: amoxtliPanda, name: "frontend" },
    { src: ecPluginsMoonlight, name: "lib" },
  ];

  const beforeRefs = beforeImages.map(() => createRef<Img>());
  const afterRefs = afterImages.map(() => createRef<Img>());
  const beforeLabelRefs = beforeImages.map(() => createRef<Txt>());
  const afterLabelRefs = afterImages.map(() => createRef<Txt>());

  const imgWidth = 200;
  const baseImageOpacity = 1;

  const divider = createRef<Line>();
  const beforeLabel = createRef<Txt>();
  const afterLabel = createRef<Txt>();
  const pill = createRef<PillLabel>();

  const afterNodeRef = createRef<Node>();
  const cameraRef = createRef<Camera>();

  // view.fill(BASE.border);

  view.add(
    <FixedCamera ref={cameraRef}>
      <Node cache={false}>
        {/* BEFORE images — left half */}
        <Layout layout gap={20} x={-450}>
          {beforeImages.map((img, i) => (
            <Layout key={`before-${img.name}-${i}`} layout direction={"column"} gap={10}>
              <Txt
                ref={beforeLabelRefs[i]}
                text={img.name}
                fontSize={16}
                fill={BASE.text}
                fontFamily={BASE.titleFont}
                opacity={0}
              />
              <Img ref={beforeRefs[i]} src={img.src} width={imgWidth} alpha={0} />
            </Layout>
          ))}
        </Layout>

        {/* Vertical divider */}
        <Line
          ref={divider}
          points={[
            [0, -220],
            [0, 220],
          ]}
          stroke={BASE.text}
          opacity={0.15}
          lineWidth={2}
          end={0}
        />

        {/* AFTER images — right half */}
        <Layout layout gap={20} x={450} ref={afterNodeRef}>
          {afterImages.map((img, i) => (
            <Layout key={`after-${img.name}-${i}`} direction={"column"} gap={10}>
              <Txt
                ref={afterLabelRefs[i]}
                text={img.name}
                fontSize={16}
                fill={BASE.text}
                fontFamily={BASE.titleFont}
                opacity={0}
              />
              <Img ref={afterRefs[i]} src={img.src} width={imgWidth} alpha={0} />
            </Layout>
          ))}
        </Layout>

        <PillLabel ref={pill} text="One theme. One repo." opacity={0} x={450} y={150} scale={0.5} />

        <Txt
          ref={beforeLabel}
          text="before"
          fontSize={20}
          fill={BASE.text}
          fontFamily={BASE.font}
          x={-450}
          y={-180}
          opacity={0}
        />
        <Txt
          ref={afterLabel}
          text="after"
          fontSize={20}
          fill={BASE.text}
          fontFamily={BASE.font}
          x={450}
          y={-180}
          opacity={0}
        />
      </Node>
    </FixedCamera>,
  );

  // Before side appears
  yield* sequence(
    0.1,
    ...beforeRefs.map((r, i) =>
      all(r().alpha(baseImageOpacity, 0.4), beforeLabelRefs[i]().opacity(0.85, 0.4)),
    ),
  );
  yield* beforeLabel().opacity(1, 0.3);

  yield* waitUntil("something-simple");

  // Divider draws
  yield* divider().end(1, 0.4, easeInOutCubic);

  // After side appears — themed
  yield* sequence(
    0.1,
    ...afterRefs.map((r, i) => all(r().alpha(1, 0.4), afterLabelRefs[i]().opacity(0.85, 0.4))),
  );
  yield* afterLabel().opacity(1, 0.3);

  yield* waitUntil("different-vscode-themes");
  const differentThemesDur = useDuration("themes");

  yield* all(
    cameraRef().centerOn(afterNodeRef(), differentThemesDur, easeOutCubic),
    cameraRef().zoom(2.5, differentThemesDur, easeOutCubic),
  );

  yield* waitUntil("one-theme-one-repo");
  yield* pill().opacity(1, 0.5);
  yield* waitFor(1.5);

  yield* all(
    ...beforeRefs.map((r) => r().alpha(0, 0.4)),
    ...afterRefs.map((r) => r().alpha(0, 0.4)),
    ...beforeLabelRefs.map((r) => r().opacity(0, 0.4)),
    ...afterLabelRefs.map((r) => r().opacity(0, 0.4)),
    divider().opacity(0, 0.4),
    beforeLabel().opacity(0, 0.3),
    afterLabel().opacity(0, 0.3),
    pill().opacity(0, 0.4),
  );
});
