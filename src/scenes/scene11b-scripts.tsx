import { makeScene2D, Rect, Txt, Layout, Line, Node } from "@motion-canvas/2d";
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
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";
import { addGroovyBackground } from "../lib/background";

const TERMINAL_LINES = [
  "$ npx tsx theme-inverter.ts",
  "  → obsidian-light-theme.json ✓",
  "  → gold-light-theme.json ✓",
  "  → turquoise-light-theme.json ✓",
  "  → jade-light-theme.json ✓",
  "  → quartz-light-theme.json ✓",
  "  8 themes generated.",
];

const TERMINAL_2_LINES = [
  "$ npx tsx theme-key-updater.ts key newValue",
  '  → Updating "key" across 16 theme(s)...',
  "  → tlapalli-amethyst-light-theme.json",
  "      → Warning: key not found — it will be added.",
  '      → "key": "(none)" → "#3f2660"',
  "  .",
  "  .",
  "  .",
  "  16 themes updated.",
];

const TERMINAL_3_LINES = [
  "$ npx tsx extract-colors.ts --theme=jade",
  "  bg:         #070b09",
  "  fg:         #3d7f5f",
  "  mid:        #4d906f",
  "  Done.",
];

const TERMINALS = [
  { lines: TERMINAL_LINES, accent: palette.quartz.dark.fg },
  { lines: TERMINAL_2_LINES, accent: palette.gold.dark.fg },
  { lines: TERMINAL_3_LINES, accent: palette.turquoise.dark.fg },
] as const;

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const termWrapperRef = createRef<Layout>();

  // One set of refs per terminal
  const termPanelRefs = TERMINALS.map(() => createRef<Rect>());
  const termLineContainers = TERMINALS.map(({ lines }) => lines.map(() => createRef<Layout>()));
  const termLineRefs = TERMINALS.map(({ lines }) => lines.map(() => createRef<Txt>()));

  view.add(
    <>
      {/* Terminal wrapper — evenly spaced column, positioned as one unit */}
      <Layout ref={termWrapperRef} layout justifyContent={"center"} gap={24} opacity={0}>
        {TERMINALS.map(({ lines, accent }, ti) => (
          <Rect
            ref={termPanelRefs[ti]}
            layout
            radius={8}
            fill={BASE.bg}
            stroke={BASE.surfaceHi}
            lineWidth={2}
            width={600}
          >
            <Layout layout direction="column" gap={8} padding={29}>
              {lines.map((line, li) => (
                <Layout layout height={0} ref={termLineContainers[ti][li]}>
                  <Txt
                    ref={termLineRefs[ti][li]}
                    text={line}
                    fontSize={20}
                    fill={li === 0 ? BASE.textMid : accent}
                    fontFamily={BASE.mono}
                    tagName="pre"
                    opacity={0}
                  />
                </Layout>
              ))}
            </Layout>
          </Rect>
        ))}
      </Layout>
    </>,
  );

  yield* waitUntil("along-side");
  yield* all(termWrapperRef().opacity(1, 0.4), termWrapperRef().position.x(0, 0.6, easeInOutCubic));

  // --- Terminals animate sequentially ---
  const termCues = [
    { cmd: "terminal-cmd", output: "terminal-output" },
    { cmd: "terminal-2", output: "terminal-2-output" },
    { cmd: "terminal-3", output: "terminal-3-output" },
  ];

  for (let ti = 0; ti < TERMINALS.length; ti++) {
    const { lines } = TERMINALS[ti];
    const { cmd, output } = termCues[ti];
    const containers = termLineContainers[ti];
    const refs = termLineRefs[ti];

    yield* waitUntil(cmd);

    // Command line typewriter
    yield* containers[0]().height("100%", 0.22, easeOutCubic);
    const cmdDur = useDuration(`${cmd}-typing`);
    const cmdCharDelay = cmdDur / lines[0].length;
    for (let i = 1; i <= lines[0].length; i++) {
      refs[0]().opacity(1);
      refs[0]().text(lines[0].slice(0, i));
      yield* waitFor(cmdCharDelay);
    }

    // Output lines
    yield* waitUntil(output);
    yield* sequence(
      0.1,
      ...containers
        .slice(1)
        .map((container, i) =>
          all(container().height("100%", 0.18, easeOutCubic), refs[i + 1]().opacity(1, 0.12)),
        ),
    );
  }

  yield* waitUntil("end-of-terminals");

  yield* sequence(
    0.08,
    ...termPanelRefs.map((ref) =>
      all(
        ref().position.x(680, 0.42, easeInOutCubic),
        ref().opacity(0, 0.42),
        ref().scale(0.96, 0.42, easeOutCubic),
      ),
    ),
  );
});
