import { makeScene2D, Code, Line, Rect, Layout, Txt } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  createSignal,
  easeInOutCubic,
  waitUntil,
} from "@motion-canvas/core";
import { BASE } from "../styles/palette";
import { PillLabel } from "../components/PillLabel";
import { addGroovyBackground } from "../lib/background";

const CODE_SNIPPET = `async preprocessCode({ codeBlock, config }) {
				if (shouldTransform(codeBlock)) {
					// Create a new instance of the TwoslashIncludesManager
					const includes = new TwoslashIncludesManager(includesMap);

					// Create a new instance of the Expressive Code Engine for use in the plugin
					const ecEngine = new ExpressiveCode(ecConfig(config));

					// Apply the includes to the code block
					const codeWithIncludes = includes.applyInclude(codeBlock.code);

					// Parse the include meta
					const include = parseIncludeMeta(codeBlock.meta);

					// Add the include to the includes map if it exists
					if (include) includes.add(include, codeWithIncludes);

					// Select the appropriate twoslasher based on language
					const selectedTwoslasher = availableTwoSlashers[codeBlock.language] ?? availableTwoSlashers.default;

					// Twoslash the code block
					const twoslash = selectedTwoslasher(codeWithIncludes, codeBlock.language, {
						...twoslashOptions,
						compilerOptions: {
							...defaultCompilerOptions,
							...(twoslashOptions?.compilerOptions ?? {}),
						},
					});`;

const COMMENT_SELECTION: [[[number, number], [number, number]]] = [
  [
    [2, 0],
    [2, 68],
  ],
];

const TOKEN_COLORS = {
  default: "#a7a7a7",
  keyword: "#6e6e6e",
  functionName: "#7a7a7a",
  variable: "#7a7a7a",
  property: "#5c5c5c",
  comment: "#333333",
  punctuation: "#585151",
} as const;

const TOKEN_PATTERNS = [
  { regex: /\/\/.*$/gm, color: TOKEN_COLORS.comment },
  { regex: /\b(function|const)\b/g, color: TOKEN_COLORS.keyword },
  { regex: /\bapplyTheme\b/g, color: TOKEN_COLORS.functionName },
  { regex: /\b(theme|bg|fg)\b/g, color: TOKEN_COLORS.variable },
  { regex: /\.(background|foreground)/g, color: TOKEN_COLORS.property },
  { regex: /[(){}.;=]/g, color: TOKEN_COLORS.punctuation },
] as const;

function createSceneHighlighter() {
  return {
    initialize() {
      return true;
    },
    prepare(code: string) {
      const spans: { start: number; end: number; color: string }[] = [];

      for (const { regex, color } of TOKEN_PATTERNS) {
        for (const match of code.matchAll(regex)) {
          if (match.index === undefined) {
            continue;
          }

          const start = match.index;
          const end = start + match[0].length;

          if (spans.some((span) => !(end <= span.start || start >= span.end))) {
            continue;
          }

          spans.push({ start, end, color });
        }
      }

      spans.sort((left, right) => left.start - right.start);
      return spans;
    },
    highlight(index: number, cache: { start: number; end: number; color: string }[]) {
      const span = cache.find((candidate) => index >= candidate.start && index < candidate.end);
      if (!span) {
        return { color: TOKEN_COLORS.default, skipAhead: 1 };
      }

      return {
        color: span.color,
        skipAhead: Math.max(1, span.end - index),
      };
    },
    tokenize(code: string) {
      return code.split(/(\s+|(?=[(){}.;=])|(?<=[(){}.;=]))/).filter(Boolean);
    },
  };
}

function normalizeHexColor(color: string) {
  if (!color.startsWith("#")) {
    return TOKEN_COLORS.default;
  }

  if (color.length === 7) {
    return color;
  }

  if (color.length === 9) {
    return color.slice(0, 7);
  }

  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  return TOKEN_COLORS.default;
}

function mixChannel(from: number, to: number, progress: number) {
  return Math.round(from + (to - from) * progress);
}

function mixHex(from: string, to: string, progress: number) {
  const fromClean = normalizeHexColor(from).replace("#", "");
  const toClean = normalizeHexColor(to).replace("#", "");
  const fromR = Number.parseInt(fromClean.slice(0, 2), 16);
  const fromG = Number.parseInt(fromClean.slice(2, 4), 16);
  const fromB = Number.parseInt(fromClean.slice(4, 6), 16);
  const toR = Number.parseInt(toClean.slice(0, 2), 16);
  const toG = Number.parseInt(toClean.slice(2, 4), 16);
  const toB = Number.parseInt(toClean.slice(4, 6), 16);

  return `#${mixChannel(fromR, toR, progress).toString(16).padStart(2, "0")}${mixChannel(fromG, toG, progress).toString(16).padStart(2, "0")}${mixChannel(fromB, toB, progress).toString(16).padStart(2, "0")}`;
}

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const codeRef = createRef<Code>();
  const selectionBgRef = createRef<Rect>();
  const arrowRef = createRef<Line>();
  const tagRef = createRef<PillLabel>();
  const tagRef2 = createRef<PillLabel>();
  const label1 = createRef<PillLabel>();
  const label2 = createRef<PillLabel>();
  const blendProgress = createSignal(0);
  const highlighter = createSceneHighlighter();

  const dramatizationRef = createRef<Txt>();

  view.add(
    <>
      <Rect
        ref={selectionBgRef}
        x={-180}
        y={-317}
        width={510}
        height={24}
        radius={4}
        fill="#00000000"
        stroke="#94ecd287"
        lineWidth={1}
        opacity={0}
      />

      <Code
        ref={codeRef}
        code={CODE_SNIPPET}
        highlighter={highlighter}
        fontSize={15}
        fontFamily={BASE.mono}
        selection={[]}
        opacity={0}
        scale={0.98}
        drawHooks={{
          token(ctx, text, position, color, selection) {
            const blended = mixHex(color, "#3d3d3d", blendProgress());
            const alpha = selection > 0 ? 1 : 0.45 + (1 - blendProgress()) * 0.25;
            ctx.fillStyle = blended;
            ctx.globalAlpha *= alpha;
            ctx.fillText(text, position.x, position.y);
          },
        }}
      />

      {/* Arrow pointing to comment line */}
      <Line
        ref={arrowRef}
        points={[
          [260, -320],
          [104, -320],
        ]}
        stroke={BASE.textMid}
        lineWidth={1.5}
        endArrow
        arrowSize={7}
        lineCap="round"
        end={0}
        opacity={0.7}
      />

      <PillLabel
        ref={tagRef}
        text="hard to read"
        accentColor={BASE.textMid}
        x={370}
        y={-320}
        opacity={0}
      />

      <PillLabel
        ref={tagRef2}
        text="keywords looked too similar"
        accentColor={BASE.textMid}
        x={370}
        y={-220}
        opacity={0}
      />

      <Layout layout direction="column" y={200}>
        <PillLabel
          ref={label1}
          text="Everything started to look the same."
          accentColor={BASE.text}
          opacity={0}
        />
        <PillLabel
          ref={label2}
          text="Which defeated the whole point."
          accentColor={BASE.text}
          opacity={0}
        />
      </Layout>

      <Txt
        ref={dramatizationRef}
        text={"**Dramatization. This is not the actual theme."}
        y={300}
        fontSize={20}
        fill="#ffffff33"
        opacity={0}
      />
    </>,
  );

  // Intro: code settles into frame before the conflict callout appears.
  yield* all(
    codeRef().opacity(1, 0.45, easeInOutCubic),
    codeRef().scale(1, 0.45, easeInOutCubic),
    codeRef().position.y(-110, 0.45, easeInOutCubic),
  );

  yield* waitFor(0.2);

  yield* dramatizationRef().opacity(1, 0.5, easeInOutCubic);

  yield* waitUntil("hard-to-read");

  // Arrow draws in toward the selected comment line.
  yield* all(
    codeRef().selection(COMMENT_SELECTION, 0.45, easeInOutCubic),
    selectionBgRef().opacity(1, 0.35, easeInOutCubic),
    arrowRef().end(1, 0.5, easeInOutCubic),
    tagRef().opacity(1, 0.4),
  );

  yield* waitUntil("keywords");

  yield* tagRef2().opacity(1, 0.4);

  yield* waitUntil("everything-same");

  yield* all(
    codeRef().selection([], 0.4, easeInOutCubic),
    blendProgress(1, 1.2, easeInOutCubic),
    selectionBgRef().opacity(0, 0.35),
    arrowRef().opacity(0, 0.5),
    tagRef().opacity(0, 0.4),
    tagRef2().opacity(0, 0.4),
    dramatizationRef().opacity(0, 0.5, easeInOutCubic),
  );

  yield* label1().opacity(1, 0.5);
  yield* waitUntil("defeated-point");
  yield* label2().opacity(1, 0.5);
  yield* waitFor(1.2);

  yield* all(codeRef().opacity(0, 0.4), label1().opacity(0, 0.4), label2().opacity(0, 0.4));
});
