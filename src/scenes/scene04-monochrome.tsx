import { makeScene2D, Rect, Node, Layout } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  sequence,
  waitUntil,
  useDuration,
} from "@motion-canvas/core";
import { BASE } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { EditorWindow } from "../components/EditorWindow";
import { FixedCamera } from "../components/FixedCamera";
import { addGroovyBackground } from "../lib/background";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const windowConfigs = [
    {
      x: 0,
      y: -8,
      scale: 1,
      zIndex: 4,
      winW: 430,
      winH: 280,
      label: "frontend",
      accent: BASE.text,
      bodyFill: "#18101c",
      tokens: [
        { color: "#9cdcfe", w: 0.56 },
        { color: "#6a9955", w: 0.44 },
        { color: "#569cd6", w: 0.24 },
        { color: "#ce9178", w: 0.29 },
        { color: "#c586c0", w: 0.2 },
        { color: "#dcdcaa", w: 0.64 },
        { color: "#4ec9b0", w: 0.27 },
        { color: "#9cdcfe", w: 0.38 },
        { color: "#6a9955", w: 0.19 },
      ],
    },

    {
      x: -530,
      y: 0,
      scale: 0.65,
      zIndex: 2,
      winW: 430,
      winH: 280,
      label: "backend",
      accent: BASE.text,
      bodyFill: "#10171c",
      tokens: [
        { color: "#4ec9b0", w: 0.34 },
        { color: "#569cd6", w: 0.16 },
        { color: "#ce9178", w: 0.26 },
        { color: "#9cdcfe", w: 0.43 },
        { color: "#6a9955", w: 0.38 },
        { color: "#dcdcaa", w: 0.19 },
        { color: "#c586c0", w: 0.14 },
        { color: "#9cdcfe", w: 0.48 },
      ],
    },

    {
      x: 546,
      y: 0,
      scale: 0.65,
      zIndex: 1,
      winW: 430,
      winH: 280,
      label: "library",
      accent: BASE.text,
      bodyFill: "#2d2d2d",
      tokens: [
        { color: "#c586c0", w: 0.2 },
        { color: "#6a9955", w: 0.44 },
        { color: "#569cd6", w: 0.12 },
        { color: "#9cdcfe", w: 0.36 },
        { color: "#dcdcaa", w: 0.24 },
        { color: "#ce9178", w: 0.29 },
        { color: "#4ec9b0", w: 0.17 },
      ],
    },
  ];

  const winRefs = windowConfigs.map(() => createRef<EditorWindow>());
  const tokenRefs = windowConfigs.map((cfg) => cfg.tokens.map(() => createRef<Rect>()));
  const label1 = createRef<PillLabel>();
  const label2 = createRef<PillLabel>();

  const drainedGreys = [
    "#777777",
    "#9a9a9a",
    "#848484",
    "#6f6f6f",
    "#909090",
    "#7a7a7a",
    "#8a8a8a",
    "#969696",
    "#747474",
    "#8e8e8e",
  ];

  const TITLE_H = 28;
  const LINE_H = 8;
  const LINE_GAP = 9;

  const cameraRef = createRef<FixedCamera>();

  view.add(
    <FixedCamera ref={cameraRef} zoom={2.5}>
      <Node>
        {windowConfigs.map((cfg, wi) => {
          const linesTop = -cfg.winH / 2 + TITLE_H + 52;
          return (
            <Node>
              <EditorWindow
                ref={winRefs[wi]}
                accentColor={cfg.accent}
                label={cfg.label}
                winWidth={cfg.winW}
                winHeight={cfg.winH}
                showPlaceholderContent={false}
                x={cfg.x}
                y={cfg.y}
                opacity={0}
                scale={cfg.scale * 0.94}
                zIndex={cfg.zIndex}
                bodyFill={cfg.bodyFill}
              />

              {cfg.tokens.map(({ color, w }, li) => (
                <Rect
                  ref={tokenRefs[wi][li]}
                  width={cfg.winW * w * cfg.scale}
                  height={Math.max(5, LINE_H * cfg.scale)}
                  radius={2}
                  fill={color}
                  opacity={0}
                  x={
                    cfg.x -
                    (cfg.winW * cfg.scale) / 2 +
                    36 * cfg.scale +
                    (cfg.winW * w * cfg.scale) / 2
                  }
                  y={cfg.y + linesTop * cfg.scale + li * (LINE_H + LINE_GAP) * cfg.scale}
                  zIndex={cfg.zIndex + 1}
                />
              ))}
            </Node>
          );
        })}

        <Layout layout direction={"column"} y={290}>
          <PillLabel ref={label1} text="Better focus." accentColor={BASE.textMid} opacity={0} />
          <PillLabel ref={label2} text="Less loaded." accentColor={BASE.textMid} opacity={0} />
        </Layout>
      </Node>
    </FixedCamera>,
  );

  // Intro: window and colorful tokens settle in.
  yield* all(
    ...winRefs.map((ref, i) =>
      all(
        ref().opacity(1, 0.38 + i * 0.1, easeInOutCubic),
        ref().scale(windowConfigs[i].scale, 0.38 + i * 0.1, easeInOutCubic),
      ),
    ),
    ...tokenRefs.flatMap((list, wi) =>
      list.map((ref, li) => ref().opacity(0.9, 0.2 + wi * 0.06 + li * 0.02, easeInOutCubic)),
    ),
  );

  const monochromeDur = useDuration("monochrome");
  yield* waitUntil("came-across");

  // drain the colors for the first window (frontend) only
  yield* sequence(
    0.2,
    ...tokenRefs[0].map((ref, li) =>
      all(
        ref().fill(drainedGreys[li % drainedGreys.length], 0.4, easeInOutCubic),
        ref().opacity(0.58 + (li % 3) * 0.09, 0.4, easeInOutCubic),
      ),
    ),
  );

  yield* winRefs[0]().bodyFill(BASE.bg, 0.5, easeInOutCubic);

  yield* cameraRef().zoom(1, monochromeDur, easeInOutCubic);

  yield* waitUntil("better-focus");
  yield* label1().opacity(1, 0.5);

  yield* waitUntil("less-loaded");
  yield* label2().opacity(1, 0.5);
  yield* waitFor(1.2);

  yield* waitUntil("winter-time");
  yield* view.fill("#02020299", 2, easeInOutCubic);

  yield* waitUntil("color-drained");

  yield* sequence(
    0.2,
    ...winRefs.splice(1).map((ref) => ref().bodyFill(BASE.bg, 1, easeInOutCubic)),
  );

  // Colors drain simultaneously to the obsidian foreground grey
  yield* sequence(
    0.2,
    ...tokenRefs
      .splice(1)
      .flatMap((list, wi) =>
        list.map((ref, li) =>
          all(
            ref().fill(drainedGreys[(li + wi * 2) % drainedGreys.length], 0.4, easeInOutCubic),
            ref().opacity(0.58 + ((li + wi) % 3) * 0.09, 0.4, easeInOutCubic),
          ),
        ),
      ),
  );

  // Outro: token traces drift out in a stagger while chrome fades continuously.
  yield* all(
    ...winRefs.map((ref, i) => ref().opacity(0, 0.45 + i * 0.04, easeInOutCubic)),
    label1().opacity(0, 0.4),
    label2().opacity(0, 0.4),
    sequence(
      0.02,
      ...tokenRefs
        .flatMap((list) => list)
        .map((ref, i) =>
          all(
            ref().position.y(ref().position.y() - 10 - (i % 3) * 3, 0.32, easeInOutCubic),
            ref().opacity(0, 0.32, easeInOutCubic),
          ),
        ),
      view.fill("#00000000", 2, easeInOutCubic),
    ),
  );
});
