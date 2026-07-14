import { makeScene2D, Rect, Txt, Line, Circle, Path, Layout, Node, Img } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  loop,
  cancel,
  waitUntil,
  easeInElastic,
  easeOutElastic,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import motionCanvasLogo from "../images/motion-canvas-logo-dark.svg";
import { addGroovyBackground } from "../lib/background";

const REPOS = [
  {
    label: "tlapalli-vscode-theme",
    color: palette.lapisLazuli.dark.mid,
    labelColor: palette.lapisLazuli.dark.mid,
    x: -465,
    kind: "theme" as const,
  },
  {
    label: "tlapalli-website",
    color: palette.turquoise.dark.fg,
    labelColor: palette.turquoise.dark.mid,
    x: -155,
    kind: "web" as const,
  },
  {
    label: "tlapalli-screenshots",
    color: palette.gold.dark.fg,
    labelColor: palette.gold.dark.mid,
    x: 155,
    kind: "scripts" as const,
  },
  {
    label: "tlapalli-video",
    color: palette.amethyst.dark.fg,
    labelColor: palette.amethyst.dark.mid,
    kind: "video" as const,
    x: 465,
  },
] as const;

const VS_CODE_MARK_OUTER_PATH =
  "M70.8511 99.3171C72.4261 99.9306 74.2221 99.8913 75.8117 99.1264L96.4 89.2197C98.5634 88.1787 99.9392 85.9892 99.9392 83.5871V16.4133C99.9392 14.0112 98.5635 11.8217 96.4001 10.7807L75.8117 0.873695C73.7255 -0.13019 71.2838 0.115699 69.4527 1.44688C69.1912 1.63705 68.942 1.84937 68.7082 2.08335L29.2943 38.0414L12.1264 25.0096C10.5283 23.7964 8.29285 23.8959 6.80855 25.246L1.30225 30.2548C-0.513334 31.9064 -0.515415 34.7627 1.29775 36.4169L16.1863 50L1.29775 63.5832C-0.515415 65.2374 -0.513334 68.0937 1.30225 69.7452L6.80855 74.754C8.29285 76.1042 10.5283 76.2036 12.1264 74.9905L29.2943 61.9586L68.7082 97.9167C69.3317 98.5405 70.0638 99.0104 70.8511 99.3171Z";
const VS_CODE_MARK_INNER_PATH = "M74.9544 27.2989L45.0483 50L74.9544 72.7012V27.2989Z";
const GITHUB_MARK_PATH =
  "M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z";
const VS_CODE_VIEWBOX_SIZE = 100;
const VS_CODE_SCALE = 0.36;
const GITHUB_VIEWBOX_SIZE = 16;
const GITHUB_SCALE = 1.8;

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const boxRefs = REPOS.map(() => createRef<Rect>());
  const line1Ref = createRef<Line>();
  const line2Ref = createRef<Line>();
  const actionsBadgeRef = createRef<Rect>();
  const actionsLabelRef = createRef<Txt>();
  const actionsIconRef = createRef<Path>();

  view.add(
    <>
      {/* Connecting lines */}
      <Line
        ref={line1Ref}
        points={[
          [-210, 0],
          [-110, 0],
        ]}
        stroke={BASE.textMid}
        lineWidth={2}
        lineDash={[8, 5]}
        end={0}
        opacity={0.95}
        zIndex={12}
      />
      <Line
        ref={line2Ref}
        points={[
          [110, 0],
          [210, 0],
        ]}
        stroke={BASE.textMid}
        lineWidth={2}
        lineDash={[8, 5]}
        end={0}
        opacity={0.95}
        zIndex={12}
      />

      {/* GitHub Actions automation cue */}
      <Rect
        ref={actionsBadgeRef}
        width={290}
        height={74}
        radius={10}
        fill={BASE.surfaceHi}
        stroke={palette.obsidian.dark.mid}
        lineWidth={1}
        y={158}
        opacity={0}
        scale={0.92}
        zIndex={9}
      >
        <Path
          ref={actionsIconRef}
          data={GITHUB_MARK_PATH}
          fill={palette.obsidian.dark.mid}
          lineWidth={0}
          x={-68 - (GITHUB_VIEWBOX_SIZE / 2) * GITHUB_SCALE}
          y={0 - (GITHUB_VIEWBOX_SIZE / 2) * GITHUB_SCALE}
          offset={[0, 0]}
          scale={GITHUB_SCALE}
          opacity={0}
        />
        <Txt
          ref={actionsLabelRef}
          text="GitHub Actions"
          fontSize={20}
          fill={BASE.textMid}
          fontFamily={BASE.font}
          x={16}
          opacity={0}
        />
      </Rect>

      {/* Repo boxes */}
      {REPOS.map((repo, i) => (
        <Rect
          ref={boxRefs[i]}
          width={220}
          height={128}
          radius={8}
          fill={BASE.surface}
          stroke={repo.color}
          lineWidth={1}
          x={repo.x}
          opacity={0}
          scale={0.88}
          zIndex={6}
        >
          {/* Per-repo iconography */}
          {repo.kind === "theme" && (
            <>
              <Rect
                width={54}
                height={54}
                radius={10}
                y={-18}
                fill={BASE.bg}
                stroke={repo.color}
                lineWidth={0}
                opacity={0.85}
              >
                <Path
                  data={VS_CODE_MARK_OUTER_PATH}
                  fill={repo.color}
                  lineWidth={0}
                  x={-(VS_CODE_VIEWBOX_SIZE / 2) * VS_CODE_SCALE}
                  y={-(VS_CODE_VIEWBOX_SIZE / 2) * VS_CODE_SCALE}
                  offset={[0, 0]}
                  scale={VS_CODE_SCALE}
                  opacity={0.85}
                />
                <Path
                  data={VS_CODE_MARK_INNER_PATH}
                  fill={BASE.bg}
                  lineWidth={0}
                  x={-(VS_CODE_VIEWBOX_SIZE / 2) * VS_CODE_SCALE}
                  y={-(VS_CODE_VIEWBOX_SIZE / 2) * VS_CODE_SCALE}
                  offset={[0, 0]}
                  scale={VS_CODE_SCALE}
                  opacity={1}
                />
              </Rect>
            </>
          )}

          {repo.kind === "web" && (
            <>
              <Rect
                width={88}
                height={56}
                radius={6}
                y={-16}
                fill={BASE.bg}
                stroke={repo.color}
                lineWidth={1}
                opacity={0.85}
              >
                <Rect
                  width={88}
                  height={13}
                  y={-21.5}
                  radius={[6, 6, 0, 0]}
                  fill={repo.color}
                  opacity={0.28}
                />
                <Circle size={4} x={-34} y={-21.5} fill={repo.color} opacity={0.7} />
                <Circle size={4} x={-24} y={-21.5} fill={repo.color} opacity={0.55} />
                <Circle size={4} x={-14} y={-21.5} fill={repo.color} opacity={0.4} />
              </Rect>
            </>
          )}

          {repo.kind === "scripts" && (
            <>
              <Rect
                width={100}
                height={58}
                radius={6}
                y={-16}
                fill={BASE.bg}
                stroke={repo.color}
                lineWidth={1}
                opacity={0.9}
              >
                <Txt
                  text="$ ./generate"
                  fontSize={11}
                  fill={repo.color}
                  fontFamily={BASE.font}
                  x={-8}
                  y={-12}
                />
                <Txt
                  text="> done"
                  fontSize={10}
                  fill={repo.color}
                  fontFamily={BASE.font}
                  x={-20}
                  y={8}
                  opacity={0.7}
                />
              </Rect>
            </>
          )}

          {repo.kind === "video" && (
            <Rect
              width={54}
              height={54}
              radius={10}
              y={-18}
              fill={BASE.bg}
              stroke={repo.color}
              lineWidth={0}
              opacity={0.85}
            >
              <Img src={motionCanvasLogo} />
            </Rect>
          )}

          <Txt
            text={repo.label}
            fontSize={20}
            fill={repo.labelColor}
            fontFamily={BASE.font}
            y={36}
            textAlign="center"
            maxWidth={186}
            textWrap
          />
        </Rect>
      ))}
    </>,
  );

  yield* sequence(
    0.2,
    ...boxRefs.map((ref) =>
      all(ref().opacity(1, 0.35, easeOutCubic), ref().scale(1, 0.5, easeOutElastic)),
    ),
  );

  yield* waitUntil("theme-repository");
  yield* all(
    boxRefs[0]().scale(1.2, 0.4, easeOutCubic),
    boxRefs[0]().scale(1.2, 0.4, easeOutCubic),
  );

  yield* waitUntil("website-repository");
  yield* all(
    boxRefs[1]().scale(1.2, 0.4, easeOutCubic),
    boxRefs[1]().scale(1.2, 0.4, easeOutCubic),
  );

  yield* waitUntil("screenshots-repository");
  yield* all(
    boxRefs[2]().scale(1.2, 0.4, easeOutCubic),
    boxRefs[2]().scale(1.2, 0.4, easeOutCubic),
  );

  yield* waitUntil("video-repository");
  yield* all(
    boxRefs[3]().scale(1.2, 0.4, easeOutCubic),
    boxRefs[3]().scale(1.2, 0.4, easeOutCubic),
  );

  yield* waitUntil("github-action");
  yield* all(
    actionsBadgeRef().opacity(1, 0.35, easeOutCubic),
    actionsBadgeRef().scale(1, 0.35, easeOutCubic),
    actionsIconRef().opacity(1, 0.3),
    actionsLabelRef().opacity(1, 0.3),
  );

  // Lines draw between them
  // yield* all(line1Ref().end(1, 0.4, easeInOutCubic), line2Ref().end(1, 0.4, easeInOutCubic));

  // // Lines pulse gently
  // const pulseTask = yield loop(Infinity, function* () {
  //   yield* all(line1Ref().opacity(0.55, 1), line2Ref().opacity(0.55, 1));
  //   yield* all(line1Ref().opacity(1, 1), line2Ref().opacity(1, 1));
  // });

  // yield* waitFor(2.4);
  // cancel(pulseTask);

  // yield* all(
  //   ...boxRefs.map((r) => r().opacity(0, 0.4)),
  //   line1Ref().opacity(0, 0.4),
  //   line2Ref().opacity(0, 0.4),
  //   actionsBadgeRef().opacity(0, 0.35),
  // );

  yield* waitUntil("repositories-out");
  yield* all(
    ...boxRefs.map((r) => r().opacity(0, 0.4)),
    line1Ref().opacity(0, 0.4),
    line2Ref().opacity(0, 0.4),
    actionsBadgeRef().opacity(0, 0.35),
  );
});
