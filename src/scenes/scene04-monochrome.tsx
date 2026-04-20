import { makeScene2D, Rect, Node } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, sequence,
} from '@motion-canvas/core';
import { BASE } from '../styles/palette';
import { PillLabel } from '../components/PillLabel';
import { EditorWindow } from '../components/EditorWindow';

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const windowConfigs = [
    {
      x: -530,
      y: 0,
      scale: 1,
      zIndex: 2,
      winW: 430,
      winH: 280,
      label: 'backend',
      accent: '#4ec9b0',
      tokens: [
        { color: '#4ec9b0', w: 0.34 },
        { color: '#569cd6', w: 0.16 },
        { color: '#ce9178', w: 0.26 },
        { color: '#9cdcfe', w: 0.43 },
        { color: '#6a9955', w: 0.38 },
        { color: '#dcdcaa', w: 0.19 },
        { color: '#c586c0', w: 0.14 },
        { color: '#9cdcfe', w: 0.48 },
      ],
    },
    {
      x: 0,
      y: -8,
      scale: 1,
      zIndex: 4,
      winW: 430,
      winH: 280,
      label: 'frontend',
      accent: '#ce9178',
      tokens: [
        { color: '#569cd6', w: 0.18 },
        { color: '#9cdcfe', w: 0.32 },
        { color: '#ce9178', w: 0.28 },
        { color: '#6a9955', w: 0.42 },
        { color: '#dcdcaa', w: 0.22 },
        { color: '#4ec9b0', w: 0.35 },
        { color: '#c586c0', w: 0.14 },
        { color: '#9cdcfe', w: 0.38 },
        { color: '#569cd6', w: 0.12 },
        { color: '#6a9955', w: 0.55 },
      ],
    },
    {
      x: 546,
      y: 0,
      scale: 1,
      zIndex: 1,
      winW: 430,
      winH: 280,
      label: 'library',
      accent: '#569cd6',
      tokens: [
        { color: '#c586c0', w: 0.2 },
        { color: '#6a9955', w: 0.44 },
        { color: '#569cd6', w: 0.12 },
        { color: '#9cdcfe', w: 0.36 },
        { color: '#dcdcaa', w: 0.24 },
        { color: '#ce9178', w: 0.29 },
        { color: '#4ec9b0', w: 0.17 },
      ],
    },
  ];

  const winRefs = windowConfigs.map(() => createRef<EditorWindow>());
  const tokenRefs = windowConfigs.map((cfg) => cfg.tokens.map(() => createRef<Rect>()));
  const label1    = createRef<PillLabel>();
  const label2    = createRef<PillLabel>();

  const drainedGreys = [
    '#777777',
    '#9a9a9a',
    '#848484',
    '#6f6f6f',
    '#909090',
    '#7a7a7a',
    '#8a8a8a',
    '#969696',
    '#747474',
    '#8e8e8e',
  ];

  const TITLE_H = 28;
  const LINE_H = 8;
  const LINE_GAP = 9;

  view.add(
    <>
      {windowConfigs.map((cfg, wi) => {
        const linesTop = -cfg.winH / 2 + TITLE_H + 52;
        return (
          <Node>
            <EditorWindow
              ref={winRefs[wi]}
              accentColor={BASE.border}
              label={cfg.label}
              winWidth={cfg.winW}
              winHeight={cfg.winH}
              showPlaceholderContent={false}
              x={cfg.x}
              y={cfg.y}
              opacity={0}
              scale={cfg.scale * 0.94}
              zIndex={cfg.zIndex}
            />

            {cfg.tokens.map(({ color, w }, li) => (
              <Rect
                ref={tokenRefs[wi][li]}
                width={cfg.winW * w * cfg.scale}
                height={Math.max(5, LINE_H * cfg.scale)}
                radius={2}
                fill={color}
                opacity={0}
                x={cfg.x - (cfg.winW * cfg.scale) / 2 + 36 * cfg.scale + (cfg.winW * w * cfg.scale) / 2}
                y={cfg.y + linesTop * cfg.scale + li * (LINE_H + LINE_GAP) * cfg.scale}
                zIndex={cfg.zIndex + 1}
              />
            ))}
          </Node>
        );
      })}

      <PillLabel ref={label1} text="Less noise." accentColor={BASE.textMid} y={230} opacity={0} />
      <PillLabel ref={label2} text="More clarity." accentColor={BASE.textMid} y={275} opacity={0} />
    </>,
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

  yield* waitFor(0.35);

  // Colors drain simultaneously to the obsidian foreground grey
  yield* all(
    ...winRefs.map((ref, i) => ref().accentColor(drainedGreys[(i * 2) % drainedGreys.length], 1.4, easeInOutCubic)),
    ...tokenRefs.flatMap((list, wi) =>
      list.map((ref, li) =>
        all(
          ref().fill(drainedGreys[(li + wi * 2) % drainedGreys.length], 1.4, easeInOutCubic),
          ref().opacity(0.58 + ((li + wi) % 3) * 0.09, 1.4, easeInOutCubic),
        ),
      ),
    ),
  );

  // Hold the stillness
  yield* waitFor(1.5);

  yield* label1().opacity(1, 0.5);
  yield* waitFor(0.3);
  yield* label2().opacity(1, 0.5);
  yield* waitFor(1.2);

  // Outro: token traces drift out in a stagger while chrome fades continuously.
  yield* all(
    ...winRefs.map((ref, i) => ref().opacity(0, 0.45 + i * 0.04, easeInOutCubic)),
    label1().opacity(0, 0.4),
    label2().opacity(0, 0.4),
    sequence(
      0.02,
      ...tokenRefs.flatMap((list) => list).map((ref, i) =>
        all(
          ref().position.y(ref().position.y() - 10 - (i % 3) * 3, 0.32, easeInOutCubic),
          ref().opacity(0, 0.32, easeInOutCubic),
        ),
      ),
    ),
  );
});