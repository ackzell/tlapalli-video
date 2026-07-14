import { makeScene2D, Rect, Circle, Txt, Layout } from "@motion-canvas/2d";
import { all, waitFor, createRef, easeInOutCubic, sequence } from "@motion-canvas/core";
import { BASE, palette, GEM_ORDER, GEM_LABELS } from "../styles/palette";
import { addGroovyBackground } from "../lib/background";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  // --- Gem positions: center gem (obsidian) + 7 surrounding ---
  // Hexagonal arrangement: 1 center + 6 ring + 1 top accent
  const gemData = [
    { name: "obsidian", x: 0, y: 0 },
    { name: "gold", x: 52, y: -30 },
    { name: "turquoise", x: 52, y: 30 },
    { name: "quartz", x: 0, y: 60 },
    { name: "lapisLazuli", x: -52, y: 30 },
    { name: "amethyst", x: -52, y: -30 },
    { name: "jade", x: 0, y: -60 },
  ] as const;

  const gemRefs = gemData.map(() => createRef<Circle>());
  const titleRef = createRef<Txt>();
  const subtitleRef = createRef<Txt>();

  // Add all gems at opacity 0
  view.add(
    <>
      <Layout x={0} y={-20}>
        {gemData.map((g, i) => (
          <Circle
            ref={gemRefs[i]}
            size={28}
            x={g.x}
            y={g.y}
            fill={palette[g.name].dark.fg}
            shadowColor={palette[g.name].dark.fg}
            shadowBlur={0}
            opacity={0}
          />
        ))}
      </Layout>

      <Txt
        ref={titleRef}
        text="Tlapalli"
        fontSize={42}
        fill={BASE.textMid}
        fontFamily={BASE.titleFont}
        y={80}
        opacity={0}
      />

      <Txt
        ref={subtitleRef}
        text="color"
        fontSize={14}
        fill={BASE.text}
        fontFamily={BASE.font}
        y={112}
        opacity={0}
      />
    </>,
  );

  // Stagger gems in — center first, then radiating outward
  yield* sequence(
    0.12,
    ...gemRefs.map((ref, i) =>
      all(ref().opacity(1, 0.5, easeInOutCubic), ref().shadowBlur(i === 0 ? 8 : 20, 0.5)),
    ),
  );

  // Title fades in
  yield* titleRef().opacity(1, 0.6, easeInOutCubic);

  // Subtitle fades in
  yield* subtitleRef().opacity(1, 0.5, easeInOutCubic);

  yield* waitFor(1.5);
});
