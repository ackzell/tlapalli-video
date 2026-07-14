import { makeScene2D, Rect, Txt, Layout } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeOutCubic,
  sequence,
  chain,
  waitUntil,
  useDuration,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { addGroovyBackground } from "../lib/background";

const JSON_ENTRIES = [
  '"editor.background": "#020202",',
  '"editor.foreground": "#a7a7a7",',
  '"editorLineNumber.foreground": "#3a3a3a",',
  '"editor.selectionBackground": "#1b1b1b",',
  '"editorWidget.background": "#0d0d0d",',
  '"editorWidget.border": "#222222",',
  '"panel.border": "#141414",',
  '"tab.activeBackground": "#0d0d0d",',
  '"tab.inactiveBackground": "#080808",',
  '"statusBar.background": "#020202",',
  '"list.activeSelectionBackground": "#1b1b1b",',
  '"list.hoverBackground": "#141414",',
];

// Each panel has a named cue — set the timing in the Motion Canvas editor
// by dragging the event markers to match your voiceover
const PANEL_CONFIGS = [
  { x: 0, y: 0, speed: 1.0, entryDelay: 0.09, cue: "panel-1" },
  { x: -600, y: -200, speed: 0.82, entryDelay: 0.11, cue: "panel-2" },
  { x: 600, y: 200, speed: 1.18, entryDelay: 0.07, cue: "panel-3" },
  { x: -600, y: 200, speed: 0.91, entryDelay: 0.1, cue: "panel-4" },
  { x: 600, y: -200, speed: 1.35, entryDelay: 0.08, cue: "panel-5" },
];

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const panelRefs = PANEL_CONFIGS.map(() => createRef<Rect>());
  const entryContainers = PANEL_CONFIGS.map(() => JSON_ENTRIES.map(() => createRef<Layout>()));
  const entryTexts = PANEL_CONFIGS.map(() => JSON_ENTRIES.map(() => createRef<Txt>()));
  const closingContainers = PANEL_CONFIGS.map(() => createRef<Layout>());
  const closingTexts = PANEL_CONFIGS.map(() => createRef<Txt>());
  const label = createRef<PillLabel>();

  view.add(
    <>
      {PANEL_CONFIGS.map((panel, pi) => (
        <Rect
          ref={panelRefs[pi]}
          width={560}
          layout
          radius={8}
          x={panel.x}
          y={panel.y}
          fill={BASE.bg}
          stroke={BASE.surfaceHi}
          lineWidth={2}
          clip
          opacity={0}
        >
          <Layout layout direction="column" gap={7} padding={20}>
            <Txt
              text='"workbench.colorCustomizations": {'
              fontSize={13}
              fill={BASE.textMid}
              fontFamily={BASE.mono}
            />

            {JSON_ENTRIES.map((entry, ei) => (
              <Layout ref={entryContainers[pi][ei]} layout direction="column" height={0} clip>
                <Txt
                  ref={entryTexts[pi][ei]}
                  text={`  ${entry}`}
                  fontSize={12}
                  fill={BASE.text}
                  fontFamily={BASE.mono}
                  opacity={0}
                />
              </Layout>
            ))}

            <Layout ref={closingContainers[pi]} layout direction="column" height={0} clip>
              <Txt
                ref={closingTexts[pi]}
                text="}"
                fontSize={13}
                fill={BASE.textMid}
                fontFamily={BASE.font}
                opacity={0}
              />
            </Layout>
          </Layout>
        </Rect>
      ))}

      <PillLabel
        ref={label}
        text="Every repo. Every theme. Every time."
        accentColor={palette.fireOpal.dark.fg}
        y={230}
        opacity={0}
      />
    </>,
  );

  // Panels are triggered by named audio cues — one cue per panel.
  // After the cue fires, entries grow in sequentially on their own.
  yield* all(
    ...PANEL_CONFIGS.map((cfg, pi) =>
      chain(
        waitUntil(cfg.cue),
        panelRefs[pi]().opacity(1, 0.35, easeOutCubic),
        sequence(
          cfg.entryDelay,
          ...entryContainers[pi].map((container, ei) =>
            all(
              container().height("100%", 0.22 * cfg.speed, easeOutCubic),
              entryTexts[pi][ei]().opacity(1, 0.18 * cfg.speed),
            ),
          ),
          all(
            closingContainers[pi]().height("100%", 0.22 * cfg.speed, easeOutCubic),
            closingTexts[pi]().opacity(1, 0.18 * cfg.speed),
          ),
        ),
      ),
    ),
  );

  yield* waitUntil("every-repo");
  yield* label().opacity(1, 0.4);

  yield* waitUntil("fade-panels");
  yield* all(...panelRefs.map((r) => r().opacity(0, 0.4)), label().opacity(0, 0.4));
});
