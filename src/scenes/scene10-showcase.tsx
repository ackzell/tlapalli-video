import { makeScene2D, Circle, Node } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  createSignal,
  easeInOutCubic,
  easeOutCubic,
  easeInCubic,
  sequence,
  linear,
  loop,
  cancel,
} from "@motion-canvas/core";
import { BASE, palette, GEM_ORDER, GEM_LABELS } from "../styles/palette";
import { GemSwatch } from "../components/GemSwatch";
import { PillLabel } from "../components/PillLabel";

// Final logo positions (from the user's scene — exact coordinates)
const LOGO_TARGETS: Record<(typeof GEM_ORDER)[number], [number, number]> = {
  obsidian: [0, 17],
  gold: [0, -118],
  turquoise: [98, -66],
  quartz: [112, 36],
  lapisLazuli: [52, 104],
  amethyst: [-52, 104],
  jade: [-112, 36],
  fireOpal: [-98, -66],
};

// Lock order: center anchor first, then clockwise from top
const LOCK_ORDER: (typeof GEM_ORDER)[number][] = [
  "obsidian",
  "gold",
  "turquoise",
  "quartz",
  "lapisLazuli",
  "amethyst",
  "jade",
  "fireOpal",
];

// Each gem's starting angle on the orbit (spread evenly, offset so no two align)
const START_ANGLES: Record<(typeof GEM_ORDER)[number], number> = {
  obsidian: 0,
  gold: Math.PI * 0.28,
  turquoise: Math.PI * 0.58,
  quartz: Math.PI * 0.82,
  lapisLazuli: Math.PI * 1.1,
  amethyst: Math.PI * 1.38,
  jade: Math.PI * 1.65,
  fireOpal: Math.PI * 1.88,
};

// Individual speed multipliers — slight variation makes it feel organic
const SPEED_MULT: Record<(typeof GEM_ORDER)[number], number> = {
  obsidian: 1.0,
  gold: 1.0,
  turquoise: 1.0,
  quartz: 1.0,
  lapisLazuli: 1.0,
  amethyst: 1.0,
  jade: 1.0,
  fireOpal: 1.0,
};

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  // --- Shared orbital state ---
  // angle: master orbit angle, driven by a signal
  // radius: shrinks over time as gravity pulls gems in
  const masterAngle = createSignal(0);
  const orbitRadius = createSignal(40);
  const locked = GEM_ORDER.reduce(
    (acc, gem) => {
      acc[gem] = createSignal(false);
      return acc;
    },
    {} as Record<(typeof GEM_ORDER)[number], ReturnType<typeof createSignal<boolean>>>,
  );

  const swatchRefs = GEM_ORDER.reduce(
    (acc, gem) => {
      acc[gem] = createRef<GemSwatch>();
      return acc;
    },
    {} as Record<(typeof GEM_ORDER)[number], ReturnType<typeof createRef<GemSwatch>>>,
  );

  const pulseRefs = GEM_ORDER.reduce(
    (acc, gem) => {
      acc[gem] = createRef<Circle>();
      return acc;
    },
    {} as Record<(typeof GEM_ORDER)[number], ReturnType<typeof createRef<Circle>>>,
  );

  const label = createRef<PillLabel>();

  // Add gems — positioned by reactive signals
  view.add(
    <Node>
      {GEM_ORDER.map((gem) => {
        const angle = START_ANGLES[gem];
        const speed = SPEED_MULT[gem];
        return (
          <Node key={gem} zIndex={gem === "obsidian" ? 10 : 0}>
            <Circle
              ref={pulseRefs[gem]}
              size={70}
              stroke={() => palette[gem].dark.fg}
              lineWidth={3}
              shadowColor={() => palette[gem].dark.fg}
              shadowBlur={12}
              opacity={0}
              x={() =>
                locked[gem]()
                  ? LOGO_TARGETS[gem][0]
                  : Math.cos(masterAngle() * speed + angle) * orbitRadius()
              }
              y={() =>
                locked[gem]()
                  ? LOGO_TARGETS[gem][1]
                  : Math.sin(masterAngle() * speed + angle) * orbitRadius()
              }
            />
            <GemSwatch
              ref={swatchRefs[gem]}
              gem={gem}
              mode="dark"
              labelOpacity={0}
              opacity={0}
              x={() =>
                locked[gem]()
                  ? LOGO_TARGETS[gem][0]
                  : Math.cos(masterAngle() * speed + angle) * orbitRadius()
              }
              y={() =>
                locked[gem]()
                  ? LOGO_TARGETS[gem][1]
                  : Math.sin(masterAngle() * speed + angle) * orbitRadius()
              }
              zIndex={0}
            />
          </Node>
        );
      })}
      <PillLabel ref={label} text="Tlapalli." accentColor={BASE.textMid} y={248} opacity={0} />
    </Node>,
  );

  // --- Phase 1 & 2: gems fade in WHILE orbiting ---
  // Run fade-in sequence and orbital motion concurrently so gems have time to relocate
  yield* all(
    sequence(0.12, ...GEM_ORDER.map((gem) => swatchRefs[gem]().opacity(1, 0.5, easeOutCubic))),
    all(
      masterAngle(masterAngle() + Math.PI * 7, 3.5, linear), // Extended orbit time
      orbitRadius(0, 3.5, easeInCubic),
    ),
  );

  // --- Phase 3: lock gems one by one ---
  for (const gem of LOCK_ORDER) {
    locked[gem](true);

    yield* swatchRefs[gem]().scale(1.35, 0.14, easeOutCubic);

    if (gem === "obsidian") {
      // enlarge obsidian gem
      yield* swatchRefs.obsidian().scale(1.7, 0.6, easeInOutCubic);
    } else {
      pulseRefs[gem]().scale(1);
      pulseRefs[gem]().opacity(1);

      yield* all(
        swatchRefs[gem]().scale(1.0, 0.28, easeInOutCubic),
        pulseRefs[gem]().scale(2.8, 0.5, easeOutCubic),
        pulseRefs[gem]().opacity(0, 0.5, easeOutCubic),
      );
    }

    yield* waitFor(0.06);
  }

  yield* waitFor(0.3);

  // Label fades in
  yield* label().opacity(1, 0.5, easeOutCubic);

  yield* waitFor(0.3);

  // Hint at light mode
  // yield* label().text('Light variants arrive next.', 0);
  // yield* all(
  //   ...GEM_ORDER.map(gem =>
  //     swatchRefs[gem]().gem('obsidian', 0),
  //   ),
  // );
  // yield* waitFor(0.15);
  // GEM_ORDER.forEach(gem => {
  //   swatchRefs[gem]().mode('light');
  // });
  // yield* all(
  //   ...GEM_ORDER.map(gem => swatchRefs[gem]().opacity(1, 0.35, easeOutCubic)),
  // );

  // yield* waitFor(0.9);

  // Fade out
  yield* all(...GEM_ORDER.map((gem) => swatchRefs[gem]().opacity(0, 0.4)), label().opacity(0, 0.4));
});
