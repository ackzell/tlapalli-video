import { makeScene2D, Txt, Layout } from "@motion-canvas/2d";
import { all, waitFor, createRef, easeInOutCubic, sequence, waitUntil } from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { TlapalliLogo } from "../components/TlapalliLogo";
import { addGroovyBackground } from "../lib/background";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const logoRef = createRef<TlapalliLogo>();
  const titleRef = createRef<Txt>();
  const urlRef = createRef<Txt>();
  const cta1Ref = createRef<PillLabel>();
  const cta2Ref = createRef<PillLabel>();

  view.add(
    <>
      <TlapalliLogo ref={logoRef} gemSize={102} y={-120} opacity={0} mode={0} />

      <Txt
        ref={titleRef}
        text="Tlapalli"
        fontSize={52}
        fill={BASE.textMid}
        fontFamily={BASE.titleFont}
        fontWeight={300}
        y={80}
        opacity={0}
      />

      <Txt
        ref={urlRef}
        text="tlapalli.ackzell.dev"
        fontSize={36}
        fill={BASE.text}
        fontFamily={BASE.mono}
        y={150}
        opacity={0}
      />

      <Layout layout y={265} gap={16}>
        <PillLabel
          ref={cta1Ref}
          text="VSCode Marketplace"
          accentColor={palette.turquoise.dark.fg}
          opacity={0}
        />
        <PillLabel
          ref={cta2Ref}
          text="Open VSX Registry"
          accentColor={palette.jade.dark.fg}
          opacity={0}
        />
      </Layout>
    </>,
  );

  // Logo appears
  yield* logoRef().opacity(1, 0.7, easeInOutCubic);

  yield* titleRef().opacity(1, 0.6);
  yield* urlRef().opacity(1, 0.5);

  yield* waitUntil("vscode-marketplace");
  yield* cta1Ref().opacity(1, 0.5, easeInOutCubic);

  yield* waitUntil("open-vsx");
  yield* cta2Ref().opacity(1, 0.5, easeInOutCubic);

  yield* waitUntil("outro");

  // Fade out — pills and URL first, then logo
  yield* all(
    cta1Ref().opacity(0, 0.4),
    cta2Ref().opacity(0, 0.4),
    urlRef().opacity(0, 0.4),
    titleRef().opacity(0, 0.4),
  );

  yield* waitFor(0.2);

  yield* logoRef().opacity(0, 0.6, easeInOutCubic);

  yield* waitFor(0.5);
});
