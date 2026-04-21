import { makeScene2D, Rect, Txt, Layout } from "@motion-canvas/2d";
import { all, waitFor, createRef, easeOutCubic, sequence } from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";

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

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const panelConfigs = [
    { x: 0, y: 0, speed: 1 },
    { x: -600, y: -200, speed: 0.8 },
    { x: 600, y: 200, speed: 1.2 },
    { x: 0, y: 0, speed: 0.65 },
    { x: -600, y: 200, speed: 0.9 },
    { x: 600, y: -200, speed: 1.4 },
  ];

  const entryContainers = panelConfigs.map(() => JSON_ENTRIES.map(() => createRef<Layout>()));
  const entryTexts = panelConfigs.map(() => JSON_ENTRIES.map(() => createRef<Txt>()));
  const closingContainers = panelConfigs.map(() => createRef<Layout>());
  const closingTexts = panelConfigs.map(() => createRef<Txt>());
  const label = createRef<PillLabel>();

  view.add(
    <>
      {panelConfigs.map((panel, panelIndex) => (
        <Rect
          width={560}
          layout
          radius={8}
          x={panel.x}
          y={panel.y}
          fill={BASE.bg}
          stroke={BASE.surfaceHi}
          lineWidth={2}
          clip
        >
          <Layout layout direction="column" gap={7} padding={20}>
            <Txt
              text='"workbench.colorCustomizations": {'
              fontSize={13}
              fill={BASE.textMid}
              fontFamily={BASE.mono}
            />

            {JSON_ENTRIES.map((entry, entryIndex) => (
              <Layout
                layout
                direction="column"
                height={0}
                clip
                ref={entryContainers[panelIndex][entryIndex]}
              >
                <Txt
                  ref={entryTexts[panelIndex][entryIndex]}
                  text={`  ${entry}`}
                  fontSize={12}
                  fill={BASE.text}
                  fontFamily={BASE.mono}
                  opacity={0}
                />
              </Layout>
            ))}

            <Layout layout direction="column" height={0} clip ref={closingContainers[panelIndex]}>
              <Txt
                ref={closingTexts[panelIndex]}
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

  yield* all(
    ...entryContainers.map((containers, panelIndex) => {
      const speed = panelConfigs[panelIndex].speed;
      const delayOffset = panelIndex * 0.2;

      return sequence(
        0.08 * speed,

        ...containers.map((container, i) =>
          all(
            waitFor(delayOffset),
            container().height("100%", 0.25 * speed, easeOutCubic),
            entryTexts[panelIndex][i]().opacity(1, 0.15 * speed),
          ),
        ),

        all(
          waitFor(delayOffset),
          closingContainers[panelIndex]().height("100%", 0.25 * speed, easeOutCubic),
          closingTexts[panelIndex]().opacity(1, 0.15 * speed),
        ),
      );
    }),
  );

  yield* waitFor(0.4);

  yield* all(label().opacity(1, 0.4));

  yield* waitFor(0.8);

  yield* all(label().opacity(0, 0.4));
});
