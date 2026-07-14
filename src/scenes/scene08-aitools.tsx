import { makeScene2D, Rect, Txt, Layout, Node } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  useRandom,
  useDuration,
  waitUntil,
  loop,
  chain,
  easeInBack,
  easeOutBounce,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { EditorWindow } from "../components/EditorWindow";
import { floatIt } from "../lib/floatIt";
import { addGroovyBackground } from "../lib/background";

const CHAT_LINES = [
  { role: "user", text: "Can you make the comments a little brighter?", cue: "chat-1" },
  { role: "assistant", text: "Sure — here is a new color for comments...", cue: "chat-2" },
  { role: "user", text: "This is too bright, comments should be more muted.", cue: "chat-3" },
  { role: "assistant", text: "All right, here is a less bright version.", cue: "chat-4" },
  { role: "user", text: "I want to customize the brackets", cue: "chat-5" },
  {
    role: "assistant",
    text: "Here is a progressive set of colors for brackets.... ",
    cue: "chat-6",
  },
  {
    role: "user",
    text: "Wait, can we shift the colors toward yellow?",
    cue: "chat-7",
  },
  {
    role: "assistant",
    text: "Sure, here is the same palette but with yellow hues.",
    cue: "chat-8",
  },
] as const;

function* streamText(
  txtRef: ReturnType<typeof createRef<Txt>>,
  containerRef: ReturnType<typeof createRef<Layout>>,
  text: string,
  role: "user" | "assistant",
  random: ReturnType<typeof useRandom>,
  duration: number,
) {
  const charDelay = duration / text.length;
  const jitter = role === "assistant" ? charDelay * 0.3 : 0;

  for (let i = 1; i <= text.length; i++) {
    txtRef().text(text.slice(0, i));
    containerRef().height("100%");
    const delay = charDelay + (jitter > 0 ? random.nextFloat(-jitter, jitter) : 0);
    yield* waitFor(Math.max(0.008, delay));
  }
}

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const random = useRandom(42);

  const chatPanelRef = createRef<Rect>();

  const chatItemContainers = CHAT_LINES.map(() => createRef<Layout>());
  const chatBubbleRefs = CHAT_LINES.map(() => createRef<Rect>());
  const chatTxtRefs = CHAT_LINES.map(() => createRef<Txt>());
  const assistantDotRefs = CHAT_LINES.map(() => createRef<Rect>());

  const obsidianWin = createRef<EditorWindow>();
  const goldWin = createRef<EditorWindow>();

  view.add(
    <>
      {/* Chat panel */}
      <Rect
        ref={chatPanelRef}
        layout
        radius={8}
        fill="#1f1f1e"
        stroke="#1f1f1e"
        lineWidth={2}
        x={-310}
        opacity={0}
      >
        <Layout layout direction="column" gap={10} padding={24} width={720}>
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
                maxWidth={720}
                scale={1}
              >
                <Txt
                  ref={chatTxtRefs[i]}
                  text=""
                  fontSize={18}
                  fill={BASE.textMid}
                  fontFamily="Open Sans"
                  textWrap
                  maxWidth={720}
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

      <Node x={500}>
        {/* Gold window underneath, invisible at first */}
        <EditorWindow
          ref={goldWin}
          accentColor={palette.gold.dark.mid}
          bodyFill={palette.gold.dark.bg}
          winWidth={480}
          winHeight={240}
          placeholderBaseOpacity={1}
          opacity={0}
        />

        {/* Obsidian window on top */}
        <EditorWindow
          ref={obsidianWin}
          accentColor={BASE.textMid}
          bodyFill={BASE.surface}
          winWidth={480}
          winHeight={240}
          placeholderBaseOpacity={0.24}
          opacity={0}
          scale={0.86}
        />
      </Node>
    </>,
  );

  // --- Chat ---
  yield* all(chatPanelRef().opacity(1, 0.4), chatPanelRef().position.x(-290, 0.6, easeInOutCubic));

  yield* all(
    obsidianWin().opacity(1, 0.6, easeInOutCubic),
    obsidianWin().scale(1, 0.6, easeInOutCubic),
  );

  yield* waitFor(0.5);
  yield floatIt(obsidianWin());
  yield floatIt(goldWin());

  let lastAssistantIdx = -1;

  for (let i = 0; i < CHAT_LINES.length; i++) {
    const line = CHAT_LINES[i];

    yield* waitUntil(line.cue);

    yield* chatItemContainers[i]().height("100%", 0.28, easeOutCubic);
    yield* chatBubbleRefs[i]().scale(1, 0.28, easeOutCubic);

    if (line.role === "user" && lastAssistantIdx !== -1) {
      yield* assistantDotRefs[lastAssistantIdx]().opacity(0, 0.15);
    }

    if (line.role === "assistant") {
      yield* assistantDotRefs[i]().opacity(1, 0.15);
      yield* waitFor(0.15);
      lastAssistantIdx = i;
    }

    const dur = useDuration(`${line.cue}-typing`);
    yield* streamText(chatTxtRefs[i], chatItemContainers[i], line.text, line.role, random, dur);
  }

  yield* waitUntil("a-single-hue");
  // Crossfade: obsidian out, gold in — slow and deliberate, like light through a gem
  yield* all(
    obsidianWin().opacity(0, 1.2, easeInOutCubic),
    goldWin().opacity(1, 1.2, easeInOutCubic),
  );

  yield* waitFor(0.4);

  // --- Outro ---
  yield* waitUntil("chat-outro");

  yield* all(
    chatPanelRef().position.x(-350, 0.42, easeInOutCubic),
    chatPanelRef().opacity(0, 0.42),
    chatPanelRef().scale(0.96, 0.42, easeOutCubic),
  );

  // Fade out the two hero windows
  yield* all(obsidianWin().opacity(0, 0.3), goldWin().opacity(0, 0.3));
});
