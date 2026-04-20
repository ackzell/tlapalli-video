import { makeScene2D, Rect, Txt, Layout } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, sequence, easeOutCubic,
} from '@motion-canvas/core';
import { BASE, palette } from '../styles/palette';
import { PillLabel } from '../components/PillLabel';

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
    {x: 0, y: 0},
    {x: -600, y: -200},
    {x: 600, y: 200},
    {x: 0, y: 0},
  ];

  const containerRefs = panelConfigs.map(() => createRef<Layout>());
  const entryRefs = panelConfigs.map(() => JSON_ENTRIES.map(() => createRef<Txt>()));
  const closingRefs = panelConfigs.map(() => createRef<Txt>());
  const label = createRef<PillLabel>();

  view.add(
    <>
      {panelConfigs.map((panel, panelIndex) => (
        <Rect
          width={560}
          height={360}
          radius={8}
          x={panel.x}
          y={panel.y}
          fill={BASE.surface}
          stroke={BASE.border}
          lineWidth={4}
          clip
        >
          <Layout
            layout
            ref={containerRefs[panelIndex]}
            direction="column"
            gap={7}
            padding={20}
            alignItems="start"
            y={10}
          >
            <Txt text='"workbench.colorCustomizations": {' fontSize={13} fill={BASE.textMid} fontFamily={BASE.font} />
            {JSON_ENTRIES.map((entry, entryIndex) => (
              <Txt
                ref={entryRefs[panelIndex][entryIndex]}
                text={`  ${entry}`}
                fontSize={12}
                fill={BASE.text}
                fontFamily={BASE.mono}
                opacity={0}
              />
            ))}
            <Txt ref={closingRefs[panelIndex]} text="}" fontSize={13} fill={BASE.textMid} fontFamily={BASE.font} opacity={0} />
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

  // Entries appear one by one — typewriter rhythm, building pressure
  yield* sequence(
    0.1,
    ...entryRefs.flatMap((list, panelIndex) => [
      ...list.map(ref => ref().opacity(1, 0.15)),
      closingRefs[panelIndex]().opacity(1, 0.15),
    ]),
  );

  yield* waitFor(0.3);

  // The chaos: entries drift and overlap
  yield* all(
    label().opacity(1, 0.4),
    ...entryRefs.flatMap((list) =>
      list.map((ref) => {
        const drift = (Math.random() - 0.5) * 30;
        const driftY = (Math.random() - 0.5) * 20;
        return all(
          ref().position.x(drift, 0.4, easeOutCubic),
          ref().position.y(driftY, 0.4, easeOutCubic),
          ref().opacity(0.4 + Math.random() * 0.3, 0.4),
        );
      }),
    ),
    ...closingRefs.map((ref) => {
      const drift = (Math.random() - 0.5) * 24;
      const driftY = (Math.random() - 0.5) * 16;
      return all(
        ref().position.x(drift, 0.4, easeOutCubic),
        ref().position.y(driftY, 0.4, easeOutCubic),
        ref().opacity(0.35 + Math.random() * 0.25, 0.4),
      );
    }),
  );

  yield* waitFor(0.8);

  yield* all(
    ...containerRefs.map((ref) => ref().opacity(0, 0.4)),
    label().opacity(0, 0.4),
  );
});