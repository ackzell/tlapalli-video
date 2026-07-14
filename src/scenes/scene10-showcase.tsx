import { makeScene2D, Circle, Node, Rect, SVG, Path, Layout, Img } from "@motion-canvas/2d";
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
  waitUntil,
  useDuration,
} from "@motion-canvas/core";
import { BASE, palette, GEM_ORDER, GEM_LABELS } from "../styles/palette";
import { GemSwatch } from "../components/GemSwatch";
import { PillLabel } from "../components/PillLabel";

import obsidianDark from "../images/screenshots/fullWindow/obsidianDark.png";
import obsidianLight from "../images/screenshots/fullWindow/obsidianLight.png";
import goldDark from "../images/screenshots/fullWindow/goldDark.png";
import goldLight from "../images/screenshots/fullWindow/goldLight.png";
import turquoiseDark from "../images/screenshots/fullWindow/turquoiseDark.png";
import turquoiseLight from "../images/screenshots/fullWindow/turquoiseLight.png";
import quartzDark from "../images/screenshots/fullWindow/quartzDark.png";
import quartzLight from "../images/screenshots/fullWindow/quartzLight.png";
import lapisLazuliDark from "../images/screenshots/fullWindow/lapisLazuliDark.png";
import lapisLazuliLight from "../images/screenshots/fullWindow/lapisLazuliLight.png";
import amethystDark from "../images/screenshots/fullWindow/amethystDark.png";
import amethystLight from "../images/screenshots/fullWindow/amethystLight.png";
import jadeDark from "../images/screenshots/fullWindow/jadeDark.png";
import jadeLight from "../images/screenshots/fullWindow/jadeLight.png";
import fireOpalDark from "../images/screenshots/fullWindow/fireOpalDark.png";
import fireOpalLight from "../images/screenshots/fullWindow/fireOpalLight.png";
import { floatIt } from "../lib/floatIt";
import { addGroovyBackground } from "../lib/background";

const screenshots = {
  obsidian: {
    dark: {
      img: obsidianDark,
      ref: createRef<Img>(),
    },
    light: {
      img: obsidianLight,
      ref: createRef<Img>(),
    },
  },
  gold: {
    dark: {
      img: goldDark,
      ref: createRef<Img>(),
    },
    light: {
      img: goldLight,
      ref: createRef<Img>(),
    },
  },
  turquoise: {
    dark: {
      img: turquoiseDark,
      ref: createRef<Img>(),
    },
    light: {
      img: turquoiseLight,
      ref: createRef<Img>(),
    },
  },
  quartz: {
    dark: {
      img: quartzDark,
      ref: createRef<Img>(),
    },
    light: {
      img: quartzLight,
      ref: createRef<Img>(),
    },
  },
  lapisLazuli: {
    dark: {
      img: lapisLazuliDark,
      ref: createRef<Img>(),
    },
    light: {
      img: lapisLazuliLight,
      ref: createRef<Img>(),
    },
  },
  amethyst: {
    dark: {
      img: amethystDark,
      ref: createRef<Img>(),
    },
    light: {
      img: amethystLight,
      ref: createRef<Img>(),
    },
  },
  jade: {
    dark: {
      img: jadeDark,
      ref: createRef<Img>(),
    },
    light: {
      img: jadeLight,
      ref: createRef<Img>(),
    },
  },
  fireOpal: {
    dark: {
      img: fireOpalDark,
      ref: createRef<Img>(),
    },
    light: {
      img: fireOpalLight,
      ref: createRef<Img>(),
    },
  },
};

// Final logo positions (from the user's scene — exact coordinates)
const LOGO_TARGETS: Record<(typeof GEM_ORDER)[number], [number, number]> = {
  obsidian: [0, 20],
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
  addGroovyBackground(view);

  // --- Shared orbital state ---
  // angle: master orbit angle, driven by a signal
  // radius: shrinks over time as gravity pulls gems in
  const masterAngle = createSignal(0);
  const orbitRadius = createSignal(120);
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
  const label2 = createRef<PillLabel>();

  // Add gems — positioned by reactive signals
  view.add(
    <>
      <Node scale={1.3}>
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
                mode={0}
                labelOpacity={0}
                gemName={gem}
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
      </Node>
      ,
      <Layout layout direction={"column"} gap={20} y={400}>
        <PillLabel ref={label} text="Tlapalli." accentColor={BASE.textMid} opacity={0} />,
        <PillLabel ref={label2} text="Means color." accentColor={BASE.textMid} opacity={0} />,
      </Layout>
    </>,
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

  yield* all(
    ...[...GEM_ORDER].reverse().map((gem) => swatchRefs[gem]().opacity(0, 0.5, easeOutCubic)),
  );

  yield* waitUntil("tlapalli");

  // Label fades in
  yield* label().opacity(1, 0.5, easeOutCubic);

  yield* waitUntil("means-color");
  yield* label2().opacity(1, 0.5, easeOutCubic);

  // yield* swatchRefs["obsidian"]().scale(1.7, 0.3, easeInOutCubic); // Ensure obsidian returns to normal size

  yield* waitUntil("the-language");
  const nahuatlDuration = useDuration("nahuatl-duration");
  const speechRef = createRef<Path>();

  view.add(
    <>
      <Path
        ref={speechRef}
        data="M30.945 10.676c4.145.205 3.925 4.94 3.733 2.69-.837-2.787-4.556-3.253-6.739-2.183a6.12 6.12 0 0 0-3.06 4.694C16.78 24.03 1.12 17.387.887 11.403c15.908-.618 18.556-1.4 31.554-6.272 5.531-2.087 12.023 1.852 10.417 9.305a11.67 11.67 0 0 1-4.735 6.89c-12.27 7.631-18.158-10.939-7.178-10.65z"
        fill="rgba(0,0,0,0)"
        stroke={BASE.border}
        lineWidth={1.18035}
        lineCap="round"
        position={[-240, -100]}
        start={0}
        end={0}
        scale={10}
      />
    </>,
  );

  yield* speechRef().end(1, nahuatlDuration, easeInOutCubic);
  yield* speechRef().fill(BASE.textMid, 0.5, easeInOutCubic);

  const screenshotsRef = createRef<Layout>();
  view.add(
    <Layout
      ref={screenshotsRef}
      layout
      gap={110}
      wrap={"wrap"}
      width={"80%"}
      justifyContent={"center"}
      zIndex={-3}
    >
      {[...GEM_ORDER].reverse().map((gem) => (
        <Img
          ref={screenshots[gem].dark.ref}
          src={screenshots[gem].dark.img}
          width={300}
          skewY={17}
          alpha={0}
        />
      ))}
    </Layout>,
  );

  yield* waitUntil("its-a-collection");
  yield* speechRef().opacity(0, 0.4, easeOutCubic);
  const collectionDuration = useDuration("collection-duration");
  const stepDuration = collectionDuration / GEM_ORDER.length;
  yield* sequence(
    stepDuration,
    ...[...GEM_ORDER]
      .reverse()
      .map((gem) => screenshots[gem].dark.ref().alpha(1, stepDuration, easeInOutCubic)),
  );

  yield* screenshotsRef().opacity(0.25, 0.5, easeOutCubic);

  for (const gem of LOCK_ORDER) {
    yield* waitUntil(gem);

    locked[gem](true);

    yield* all(
      pulseRefs[gem]().y(LOGO_TARGETS[gem][1] - 10, 0.14, easeOutCubic),
      swatchRefs[gem]().opacity(1, 0.14, easeOutCubic),
      gem === "obsidian"
        ? swatchRefs[gem]().scale(1.8, 0.14, easeOutCubic)
        : swatchRefs[gem]().scale(1.35, 0.14, easeOutCubic),
    );

    pulseRefs[gem]().scale(1);
    pulseRefs[gem]().opacity(1);

    yield* all(
      gem === "obsidian"
        ? swatchRefs[gem]().scale(1.7, 0.28, easeInOutCubic)
        : swatchRefs[gem]().scale(1.0, 0.28, easeInOutCubic),
      swatchRefs[gem]().labelOpacity(1, 0.28, easeInOutCubic),
      pulseRefs[gem]().scale(2.8, 0.5, easeOutCubic),
      pulseRefs[gem]().opacity(0, 0.5, easeOutCubic),
    );

    yield* waitFor(0.06);

    yield* swatchRefs[gem]().labelOpacity(0, 0.28, easeInOutCubic);
  }

  const lightScreenshotsRef = createRef<Layout>();
  view.add(
    <Layout
      ref={lightScreenshotsRef}
      layout
      gap={110}
      wrap={"wrap"}
      width={"80%"}
      justifyContent={"center"}
      zIndex={-3}
      opacity={0}
    >
      {[...GEM_ORDER].reverse().map((gem) => (
        <Img
          ref={screenshots[gem].light.ref}
          src={screenshots[gem].light.img}
          width={300}
          skewY={17}
        />
      ))}
    </Layout>,
  );

  yield* waitUntil("light-modes");

  // Hint at light mode
  // yield* all(...GEM_ORDER.map((gem) => swatchRefs[gem]().gem("obsidian", 0)));

  yield* all(
    ...GEM_ORDER.map((gem) => swatchRefs[gem]().mode(1, 0.7, easeInOutCubic)),
    lightScreenshotsRef().opacity(0.35, 0.7, easeInOutCubic),
  );

  // yield* waitFor(0.9);

  yield* waitUntil("fade-out");

  // Fade out
  yield* sequence(
    0.12,
    ...GEM_ORDER.map((gem) => swatchRefs[gem]().opacity(0, 0.8, easeOutCubic)),
    label().opacity(0, 0.8, easeOutCubic),
    label2().opacity(0, 0.8, easeOutCubic),
    ...GEM_ORDER.map((gem) => screenshots[gem].light.ref().alpha(0, 0.8, easeOutCubic)),
    ...GEM_ORDER.map((gem) => screenshots[gem].dark.ref().alpha(0, 0.8, easeOutCubic)),
  );
});
