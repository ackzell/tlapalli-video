import { makeScene2D, Rect, Img, Line, Txt, Video, Layout } from "@motion-canvas/2d";
import {
  all,
  waitFor,
  createRef,
  easeInOutCubic,
  easeOutCubic,
  useDuration,
  waitUntil,
} from "@motion-canvas/core";
import { BASE, palette } from "../styles/palette";

import desktopVideo from "../videos/tlapalli-website-desktop.mp4";
import mobileVideo from "../videos/tlapalli-website-mobile.mp4";
import { addGroovyBackground } from "../lib/background";

export default makeScene2D(function* (view) {
  addGroovyBackground(view);

  const browserRef = createRef<Rect>();
  const landingRef = createRef<Img>();
  const featuresRef = createRef<Img>();
  const footerRef = createRef<Img>();

  const frostedCardRef = createRef<Rect>();
  const frostedGemCardRef = createRef<Rect>();

  const frostedRefs = [createRef<Img>(), createRef<Img>(), createRef<Img>()];
  const frostedGemRefs = [createRef<Img>(), createRef<Img>(), createRef<Img>()];

  const desktopVideoRef = createRef<Video>();
  const mobileVideoRef = createRef<Video>();

  view.add(
    <>
      <Video
        ref={desktopVideoRef}
        src={desktopVideo}
        radius={9}
        opacity={0}
        scale={0.35}
        x={-280}
        y={-50}
      />
      <Video ref={mobileVideoRef} src={mobileVideo} radius={9} opacity={0} scale={0.35} x={620} />
    </>,
  );

  const websiteIntroDuration = useDuration("website-explainer");

  yield* waitUntil("website-intro");
  yield* all(
    desktopVideoRef().opacity(1, 0.45, easeOutCubic),
    desktopVideoRef().y(0, 0.8, easeOutCubic),
  );
  desktopVideoRef().play();

  yield* waitUntil("frosted-glass");
  yield* all(
    mobileVideoRef().opacity(1, 0.45, easeOutCubic),
    mobileVideoRef().x(590, 0.8, easeOutCubic),
  );
  mobileVideoRef().seek(29);
  mobileVideoRef().play();

  yield* waitUntil("website-out");
  yield* all(
    desktopVideoRef().opacity(0, 0.45, easeInOutCubic),
    desktopVideoRef().scale(0.38, 0.45, easeInOutCubic),
    mobileVideoRef().opacity(0, 0.45, easeInOutCubic),
    mobileVideoRef().scale(0.38, 0.45, easeInOutCubic),
  );
});
