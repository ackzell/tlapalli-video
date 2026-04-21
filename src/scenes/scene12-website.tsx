import { makeScene2D, Rect, Img, Line, Txt } from "@motion-canvas/2d";
import { all, waitFor, createRef, easeInOutCubic, easeOutCubic } from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";

import websiteLanding from "../images/website/website-landing.png";
import websiteFeatures from "../images/website/website-features.png";
import websiteFooter from "../images/website/website-footer.png";

import frostedObsidian from "../images/website/frosted-obsidian.png";
import frostedTurquoise from "../images/website/frosted-turquoise.png";
import frostedGold from "../images/website/frosted-gold.png";

import frostedGemObsidian from "../images/website/frosted-gem-obsidian.png";
import frostedGemTurquoise from "../images/website/frosted-gem-turquoise.png";
import frostedGemGold from "../images/website/frosted-gem-gold.png";

const CALLOUTS = [
  {
    text: "frosted glass header",
    color: palette.turquoise.dark.fg,
    x: 290,
    y: -122,
    lineEnd: [130, -96] as [number, number],
  },
  {
    text: "haptic on mobile",
    color: palette.amethyst.dark.fg,
    x: 305,
    y: 4,
    lineEnd: [155, 4] as [number, number],
  },
  {
    text: "gems are buttons",
    color: palette.gold.dark.fg,
    x: 285,
    y: -168,
    lineEnd: [92, -150] as [number, number],
  },
] as const;

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const browserRef = createRef<Rect>();
  const landingRef = createRef<Img>();
  const featuresRef = createRef<Img>();
  const footerRef = createRef<Img>();

  const frostedCardRef = createRef<Rect>();
  const frostedGemCardRef = createRef<Rect>();

  const frostedRefs = [createRef<Img>(), createRef<Img>(), createRef<Img>()];
  const frostedGemRefs = [createRef<Img>(), createRef<Img>(), createRef<Img>()];

  const calloutRefs = CALLOUTS.map(() => ({
    line: createRef<Line>(),
    pill: createRef<PillLabel>(),
  }));

  view.add(
    <>
      <Rect
        ref={browserRef}
        width={960}
        height={472}
        radius={9}
        fill={BASE.surface}
        stroke={BASE.border}
        lineWidth={1}
        y={-18}
        clip
        opacity={0}
      >
        <Rect width={860} height={30} y={-221} fill={BASE.bg} radius={[9, 9, 0, 0]}>
          <Rect width={126} height={20} x={-332} radius={4} fill={BASE.surfaceHi}>
            <Txt text="tlapalli.ackzell.dev" fontSize={9} fill={BASE.text} fontFamily={BASE.font} />
          </Rect>
        </Rect>

        <Img ref={landingRef} src={websiteLanding} height={620} y={15} opacity={0} />
        <Img ref={featuresRef} src={websiteFeatures} height={620} y={15} opacity={0} />
        <Img ref={footerRef} src={websiteFooter} height={620} y={15} opacity={0} />
      </Rect>

      {CALLOUTS.map((c, i) => (
        <>
          <Line
            ref={calloutRefs[i].line}
            points={[c.lineEnd, [c.x - 10, c.y]]}
            stroke={c.color}
            lineWidth={1}
            opacity={0.6}
            end={0}
          />
          <PillLabel
            ref={calloutRefs[i].pill}
            text={c.text}
            accentColor={c.color}
            x={c.x + 88}
            y={c.y}
            opacity={0}
          />
        </>
      ))}

      <Rect
        ref={frostedCardRef}
        width={600}
        height={276}
        x={-502}
        radius={8}
        fill={BASE.surface}
        stroke={BASE.border}
        lineWidth={1}
        clip
        opacity={0}
      >
        <Img ref={frostedRefs[0]} src={frostedObsidian} width={584} y={0} opacity={0} />
        <Img ref={frostedRefs[1]} src={frostedTurquoise} width={584} y={0} opacity={0} />
        <Img ref={frostedRefs[2]} src={frostedGold} width={584} y={0} opacity={0} />
      </Rect>

      <Rect
        ref={frostedGemCardRef}
        width={600}
        height={276}
        x={352}
        radius={8}
        fill={BASE.surface}
        stroke={BASE.border}
        lineWidth={1}
        clip
        opacity={0}
      >
        <Img ref={frostedGemRefs[0]} src={frostedGemObsidian} width={584} y={0} opacity={0} />
        <Img ref={frostedGemRefs[1]} src={frostedGemTurquoise} width={584} y={0} opacity={0} />
        <Img ref={frostedGemRefs[2]} src={frostedGemGold} width={584} y={0} opacity={0} />
      </Rect>
    </>,
  );

  yield* all(
    browserRef().opacity(1, 0.45, easeOutCubic),
    landingRef().opacity(1, 0.45, easeOutCubic),
  );

  yield* waitFor(0.25);

  yield* all(
    ...calloutRefs.map(({ line, pill }) =>
      all(line().end(1, 0.35, easeInOutCubic), pill().opacity(1, 0.35)),
    ),
  );

  yield* waitFor(0.75);

  yield* all(
    ...calloutRefs.map(({ line, pill }) => all(line().opacity(0, 0.25), pill().opacity(0, 0.25))),
  );

  yield* waitFor(0.35);

  yield* all(
    landingRef().opacity(0, 0.68, easeInOutCubic),
    featuresRef().opacity(1, 0.68, easeInOutCubic),
  );

  yield* waitFor(0.45);

  yield* all(
    featuresRef().opacity(0, 0.68, easeInOutCubic),
    footerRef().opacity(1, 0.68, easeInOutCubic),
  );

  yield* waitFor(0.95);

  // Details phase starts after overview walkthrough.
  yield* browserRef().opacity(0, 0.38);

  yield* all(
    frostedCardRef().opacity(1, 0.4),
    frostedGemCardRef().opacity(1, 0.4),
    frostedRefs[0]().opacity(1, 0.4),
    frostedGemRefs[0]().opacity(1, 0.4),
  );

  yield* waitFor(0.3);

  yield* all(
    frostedRefs[0]().opacity(0, 0.62, easeInOutCubic),
    frostedRefs[1]().opacity(1, 0.62, easeInOutCubic),
    frostedGemRefs[0]().opacity(0, 0.62, easeInOutCubic),
    frostedGemRefs[1]().opacity(1, 0.62, easeInOutCubic),
  );

  yield* waitFor(0.25);

  yield* all(
    frostedRefs[1]().opacity(0, 0.62, easeInOutCubic),
    frostedRefs[2]().opacity(1, 0.62, easeInOutCubic),
    frostedGemRefs[1]().opacity(0, 0.62, easeInOutCubic),
    frostedGemRefs[2]().opacity(1, 0.62, easeInOutCubic),
  );

  yield* waitFor(0.85);

  //   yield* all(
  //     frostedCardRef().opacity(0, 0.35),
  //     frostedGemCardRef().opacity(0, 0.35),
  //   );

  yield* frostedCardRef().opacity(0, 0.35);
  yield* frostedGemCardRef().opacity(0, 0.35);
});
