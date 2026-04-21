import { makeScene2D, Rect, Txt, Layout, Line } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  useRandom,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";

const CHAT_LINES = [
  { role: "user", text: "Can you generate a yellow variant?" },
  { role: "assistant", text: "Sure — here is a yellow variant..." },
  { role: "user", text: "This is too bright, I want more muted colors." },
  { role: "assistant", text: "All right, here is a less bright version." },
  { role: "user", text: "What about a script that inverts the theme?" },
  { role: "assistant", text: "Here is a script that inverts the theme colors." },
] as const;

const TERMINAL_LINES = [
  "$ npx tsx theme-inverter.ts",
  "  → obsidian-light-theme.json ✓",
  "  → gold-light-theme.json ✓",
  "  → turquoise-light-theme.json ✓",
  "  → jade-light-theme.json ✓",
  "  → quartz-light-theme.json ✓",
  "  8 themes generated.",
];

function* streamText(
  txtRef: ReturnType<typeof createRef<Txt>>,
  containerRef: ReturnType<typeof createRef<Layout>>,
  text: string,
  role: "user" | "assistant",
  random: ReturnType<typeof useRandom>,
) {
  const baseDelay = role === "user" ? 0.022 : 0.032;
  const jitter = role === "user" ? 0 : 0.024;

  for (let i = 1; i <= text.length; i++) {
    txtRef().text(text.slice(0, i));

    // 🔥 key: keep nudging layout so it grows while typing
    containerRef().height("100%");

    const delay = baseDelay + (jitter > 0 ? random.nextFloat(0, jitter) : 0);
    yield* waitFor(delay);
  }
}

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const random = useRandom(42);

  const chatPanelRef = createRef<Rect>();
  const termPanelRef = createRef<Rect>();
  const connectorRef = createRef<Line>();

  const chatItemContainers = CHAT_LINES.map(() => createRef<Layout>());
  const chatBubbleRefs = CHAT_LINES.map(() => createRef<Rect>());
  const chatTxtRefs = CHAT_LINES.map(() => createRef<Txt>());
  const assistantDotRefs = CHAT_LINES.map(() => createRef<Rect>());

  const termLineContainers = TERMINAL_LINES.map(() => createRef<Layout>());
  const termLineRefs = TERMINAL_LINES.map(() => createRef<Txt>());

  view.add(
    <>
      {/* Chat panel */}
      <Rect
        ref={chatPanelRef}
        width={420}
        layout
        radius={8}
        fill="#1f1f1e"
        stroke="#1f1f1e"
        lineWidth={2}
        x={-310}
        opacity={0}
        clip
      >
        <Layout layout direction="column" gap={10} padding={16} width={420}>
          {CHAT_LINES.map((line, i) => (
            <Layout layout direction="column" height={0} clip ref={chatItemContainers[i]}>
              <Rect
                ref={chatBubbleRefs[i]}
                fill={line.role === "user" ? "#121212" : "#00000000"}
                stroke={line.role === "user" ? "#121212" : "#00000000"}
                lineWidth={1}
                radius={8}
                padding={10}
                paddingLeft={14}
                paddingRight={14}
                alignSelf={line.role === "user" ? "end" : "start"}
                maxWidth={330}
                scale={0.98}
              >
                <Txt
                  ref={chatTxtRefs[i]}
                  text=""
                  fontSize={12}
                  fill={BASE.textMid}
                  fontFamily="Open Sans"
                  textWrap
                  maxWidth={310}
                />
              </Rect>

              {line.role === "assistant" ? (
                <Rect
                  ref={assistantDotRefs[i]}
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
            </Layout>
          ))}
        </Layout>
      </Rect>

      {/* Connector */}
      <Line
        ref={connectorRef}
        points={[
          [-50, 0],
          [50, 0],
        ]}
        stroke={palette.turquoise.dark.fg}
        lineWidth={1.5}
        lineDash={[6, 4]}
        end={0}
        opacity={0.6}
      />

      {/* Terminal panel */}
      <Rect
        ref={termPanelRef}
        width={320}
        layout
        radius={8}
        fill={BASE.bg}
        stroke={BASE.surfaceHi}
        lineWidth={2}
        x={320}
        opacity={0}
        clip
      >
        <Layout layout direction="column" gap={8} padding={16}>
          {TERMINAL_LINES.map((line, i) => (
            <Layout layout height={0} clip ref={termLineContainers[i]}>
              <Txt
                ref={termLineRefs[i]}
                text={line}
                fontSize={12}
                fill={i === 0 ? BASE.textMid : palette.jade.dark.fg}
                fontFamily={BASE.mono}
                opacity={0} // 👈 important
              />
            </Layout>
          ))}
        </Layout>
      </Rect>
    </>,
  );

  // --- Chat ---

  yield* all(chatPanelRef().opacity(1, 0.4), chatPanelRef().position.x(-290, 0.6, easeInOutCubic));
  let lastAssistantIdx = -1;

  for (let i = 0; i < CHAT_LINES.length; i++) {
    const line = CHAT_LINES[i];

    yield* chatItemContainers[i]().height("100%", 0.28, easeOutCubic);

    yield* chatBubbleRefs[i]().scale(1, 0.28, easeOutCubic);

    if (line.role === "user" && lastAssistantIdx !== -1) {
      yield* assistantDotRefs[lastAssistantIdx]().opacity(0, 0.15);
    }

    if (line.role === "assistant") {
      yield* assistantDotRefs[i]().opacity(1, 0.15);
      yield* waitFor(0.2);
      lastAssistantIdx = i;
    }

    yield* streamText(chatTxtRefs[i], chatItemContainers[i], line.text, line.role, random);

    yield* waitFor(line.role === "user" ? 0.1 : 0.18);
  }

  // --- Connector ---
  yield* connectorRef().end(1, 0.5, easeInOutCubic);

  // --- Terminal ---

  yield* all(termPanelRef().opacity(1, 0.4), termPanelRef().position.x(270, 0.6, easeInOutCubic));
  // 1. First line: typewriter + growth
  yield* termLineContainers[0]().height("100%", 0.25, easeOutCubic);

  for (let i = 1; i <= TERMINAL_LINES[0].length; i++) {
    termLineRefs[0]().opacity(1);
    termLineRefs[0]().text(TERMINAL_LINES[0].slice(0, i));
    yield* waitFor(0.035);
  }

  // small pause before output appears
  yield* waitFor(0.2);

  // 2. Output lines: line-by-line (fast, slightly staggered)
  yield* sequence(
    0.12,
    ...termLineContainers
      .slice(1)
      .map((container, i) =>
        all(container().height("100%", 0.22, easeOutCubic), termLineRefs[i + 1]().opacity(1, 0.15)),
      ),
  );

  yield* waitFor(1.2);

  // Outro
  yield* all(connectorRef().end(0, 0.35, easeInOutCubic), connectorRef().opacity(0, 0.3));

  yield* all(
    chatPanelRef().position.x(-350, 0.42, easeInOutCubic),
    termPanelRef().position.x(330, 0.42, easeInOutCubic),
    chatPanelRef().opacity(0, 0.42),
    termPanelRef().opacity(0, 0.42),
    chatPanelRef().scale(0.96, 0.42, easeOutCubic),
    termPanelRef().scale(0.96, 0.42, easeOutCubic),
  );
});
