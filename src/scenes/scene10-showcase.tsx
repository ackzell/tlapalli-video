import { makeScene2D, Txt, Layout } from '@motion-canvas/2d';
import {
  all, waitFor, createRef, easeInOutCubic, easeOutCubic, sequence,
} from '@motion-canvas/core';
import { BASE, GEM_ORDER, GEM_LABELS } from '../styles/palette';
import { GemSwatch } from '../components/GemSwatch';
import { PillLabel } from '../components/PillLabel';

export default makeScene2D(function* (view) {
  view.fill(BASE.bg);

  const swatchRefs = GEM_ORDER.map(() => createRef<GemSwatch>());
  const modeLabel  = createRef<PillLabel>();

  view.add(
    <>
      
      {/* 4×2 gem grid */}
      <Layout
        layout
        direction="row"
        gap={24}
        wrap="wrap"
        width={480}
        justifyContent="center"
        y={-20}
      >
        {GEM_ORDER.map((gem, i) => (
          <GemSwatch
            ref={swatchRefs[i]}
            gem={gem}
            mode="dark"
            gemName={GEM_LABELS[gem]}
            opacity={0}
            scale={1}
          />
        ))}
      </Layout>

      {/* Mode toggle label */}
      <PillLabel
        ref={modeLabel}
        text="dark variants"
        accentColor={BASE.textMid}
        y={210}
        opacity={0}
      />
    </>,
  );


  yield* waitFor(0.35);


  // Swatches stagger in
  yield* sequence(
    0.08,
    ...swatchRefs.map(ref =>
      all(
        ref().opacity(1, 0.4, easeOutCubic),
        ref().scale(1, 0.4, easeOutCubic),
      ),
    ),
  );

  yield* modeLabel().opacity(1, 0.35);

  yield* waitFor(0.8);

  // Toggle to light mode with a short desaturated dip.
  yield* all(
    ...swatchRefs.map(ref => ref().opacity(0.68, 0.22, easeInOutCubic)),
  );

  swatchRefs.forEach((ref) => ref().mode('light'));
  yield* modeLabel().text('light variants', 0);

  yield* all(
    ...swatchRefs.map(ref => ref().opacity(1, 0.28, easeInOutCubic)),
  );

  yield* waitFor(0.6);

  // Toggle back to dark.
  yield* all(
    ...swatchRefs.map(ref => ref().opacity(0.68, 0.22, easeInOutCubic)),
  );

  swatchRefs.forEach((ref) => ref().mode('dark'));
  yield* modeLabel().text('dark variants', 0);

  yield* all(
    ...swatchRefs.map(ref => ref().opacity(1, 0.28, easeInOutCubic)),
  );

  yield* waitFor(1);

  yield* all(
    ...swatchRefs.map(r => r().opacity(0, 0.4)),
    modeLabel().opacity(0, 0.4),
  );
}); 