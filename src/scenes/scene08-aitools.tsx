import { makeScene2D, Rect, Txt, Layout, Line } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, easeOutCubic, sequence,
} from '@motion-canvas/core';
import { BASE, palette } from '../styles/palette';

const CHAT_LINES = [
  { role: 'user',      text: 'Can you generate a yellow variant of this theme?' },
  { role: 'assistant', text: 'Sure — here is a yellow variant...' },
  { role: 'user',      text: 'This is too bright, I want more muted colors.' },
  { role: 'assistant', text: 'All right, here is a less bright version.' },
  { role: 'user',      text: 'What about a script that inverts the theme?' },
  { role: 'assistant', text: 'Here is a script that inverts the theme colors.' },
];

const TERMINAL_LINES = [
  '$ npx tsx theme-inverter.ts',
  '  → obsidian-light-theme.json ✓',
  '  → gold-light-theme.json ✓',
  '  → turquoise-light-theme.json ✓',
  '  → jade-light-theme.json ✓',
  '  → quartz-light-theme.json ✓',
  '  8 themes generated.',
];

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const chatPanelRef = createRef<Rect>();
  const termPanelRef = createRef<Rect>();
  const chatRef     = createRef<Layout>();
  const termRef     = createRef<Layout>();
  const connectorRef = createRef<Line>();

  const chatBubbleRefs = CHAT_LINES.map(() => createRef<Rect>());
  const assistantLogoRefs = CHAT_LINES.map(() => createRef<Rect>());
  const termLineRefs   = TERMINAL_LINES.map(() => createRef<Txt>());

  view.add(
    <>
      {/* Chat panel — left */}
      <Rect
        ref={chatPanelRef}
        width={420}
        height={340}
        radius={8}
        fill="#1f1f1e"
        stroke="#1f1f1e"
        lineWidth={2}
        x={-290}
        clip
      >
        <Layout
          layout
          ref={chatRef}
          direction="column"
          gap={10}
          padding={16}
          alignItems="start"
          width={420}
        >
          
          {CHAT_LINES.map((line, i) => (
            <>
              <Rect
                ref={chatBubbleRefs[i]}
                fill={line.role === 'user' ? '#121212' : '#00000000'}
                stroke={line.role === 'user' ? '#121212' : '#00000000'}
                lineWidth={1}
                radius={8}
                padding={10}
                paddingLeft={14}
                paddingRight={14}
                alignSelf={line.role === 'user' ? 'end' : 'start'}
                opacity={0}
                maxWidth={330}
              >
                <Txt
                  text={line.text}
                  fontSize={12}
                  fill={line.role === 'user' ? BASE.textMid : BASE.textMid}
                  fontFamily="Open Sans"
                  textWrap
                  maxWidth={310}
                />
              </Rect>

              {line.role === 'assistant' ? (
                <Rect
                  ref={assistantLogoRefs[i]}
                  alignSelf="start"
                  marginLeft={10}
                  marginTop={-4}
                  fill="#D97757"
                  radius={10}
                  opacity={0}
                  width={10}
                  height={10}
                />
              ) : null}
            </>
          ))}
        </Layout>
      </Rect>

      {/* Connector line — data flowing right */}
      <Line
        ref={connectorRef}
        points={[[-50, 0], [50, 0]]}
        stroke={palette.turquoise.dark.fg}
        lineWidth={1.5}
        lineDash={[6, 4]}
        end={0}
        opacity={0.6}
      />

      {/* Terminal panel — right */}
      <Rect
        ref={termPanelRef}
        width={320}
        height={340}
        radius={8}
        fill={BASE.bg}
        stroke={BASE.surfaceHi}
        lineWidth={2}
        x={270}
        clip
      >
        <Layout
          layout
          ref={termRef}
          direction="column"
          gap={8}
          padding={16}
          alignItems="start"
        >
          {TERMINAL_LINES.map((line, i) => (
            <Txt
              ref={termLineRefs[i]}
              text={line}
              fontSize={12}
              fill={i === 0 ? BASE.textMid : palette.jade.dark.fg}
              fontFamily={BASE.mono}
              opacity={0}
            />
          ))}
        </Layout>
      </Rect>
    </>,
  );

  // Chat bubbles appear sequentially. Assistant marker moves down and hides on user turns.
  let activeAssistantIndex = -1;
  for (let i = 0; i < CHAT_LINES.length; i++) {
    const line = CHAT_LINES[i];
    yield* chatBubbleRefs[i]().opacity(1, 0.35, easeOutCubic);

    if (line.role === 'assistant') {
      yield* assistantLogoRefs[i]().opacity(1, 0.22, easeOutCubic);
      activeAssistantIndex = i;
    } else if (activeAssistantIndex !== -1) {
      yield* assistantLogoRefs[activeAssistantIndex]().opacity(0, 0.2, easeInOutCubic);
    }

    yield* waitFor(0.06);
  }

  // Connector draws across
  yield* connectorRef().end(1, 0.5, easeInOutCubic);

  // Terminal lines stream in
  yield* sequence(
    0.18,
    ...termLineRefs.map(ref => ref().opacity(1, 0.2)),
  );

  yield* waitFor(1.2);

  // Outro: data flow retracts, then both panels drift away.
  yield* all(
    connectorRef().end(0, 0.35, easeInOutCubic),
    connectorRef().opacity(0, 0.3),
  );

  yield* all(
    chatPanelRef().position.x(-350, 0.42, easeInOutCubic),
    termPanelRef().position.x(330, 0.42, easeInOutCubic),
    chatPanelRef().opacity(0, 0.42),
    termPanelRef().opacity(0, 0.42),
    chatPanelRef().scale(0.96, 0.42, easeOutCubic),
    termPanelRef().scale(0.96, 0.42, easeOutCubic),
    chatRef().opacity(0, 0.3),
    termRef().opacity(0, 0.3),
  );
});