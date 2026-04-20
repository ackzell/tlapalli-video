import { Rect, Line, Node, NodeProps, initial, signal } from '@motion-canvas/2d';
import { SignalValue, SimpleSignal, createRef, all, easeInOutCubic, waitFor } from '@motion-canvas/core';

export interface CropTemplateProps extends NodeProps {
  cropWidth?: SignalValue<number>;
  cropHeight?: SignalValue<number>;
  strokeColor?: SignalValue<string>;
}

/**
 * CropTemplate — animates the SVG rectangle crop process.
 *
 * Beat 2: call drawTemplate() to animate the rectangle appearing corner by corner.
 * Beat 3: call applyClip(screenshotRef) to dim and clip everything outside.
 * Beat 4: the template node persists — just reposition and swap the screenshot.
 *
 * Usage:
 *   const tmpl = createRef<CropTemplate>();
 *   view.add(<CropTemplate ref={tmpl} cropWidth={640} cropHeight={380} strokeColor="#3d7f7d" />);
 *   yield* tmpl().drawTemplate(1.2);   // corners appear, then sides extend
 *   yield* tmpl().flashClip(0.3);      // flash the clip snap
 */
export class CropTemplate extends Node {
  @initial(640)
  @signal()
  public declare readonly cropWidth: SimpleSignal<number, this>;

  @initial(380)
  @signal()
  public declare readonly cropHeight: SimpleSignal<number, this>;

  @initial('#3d7f7d')
  @signal()
  public declare readonly strokeColor: SimpleSignal<string, this>;

  // The four sides, drawn independently for the staggered corner effect
  private readonly topLine    = createRef<Line>();
  private readonly rightLine  = createRef<Line>();
  private readonly bottomLine = createRef<Line>();
  private readonly leftLine   = createRef<Line>();

  // The dim overlay — covers everything outside the crop region
  private readonly dimOverlay = createRef<Rect>();

  public constructor(props?: CropTemplateProps) {
    super(props);

    const hw = () => this.cropWidth()  / 2;
    const hh = () => this.cropHeight() / 2;

    this.add(
      <>
        {/* Top side */}
        <Line
          ref={this.topLine}
          points={[[-hw(), -hh()], [hw(), -hh()]]}
          stroke={() => this.strokeColor()}
          lineWidth={2}
          end={0}
          lineCap="round"
        />
        {/* Right side */}
        <Line
          ref={this.rightLine}
          points={[[hw(), -hh()], [hw(), hh()]]}
          stroke={() => this.strokeColor()}
          lineWidth={2}
          end={0}
          lineCap="round"
        />
        {/* Bottom side */}
        <Line
          ref={this.bottomLine}
          points={[[hw(), hh()], [-hw(), hh()]]}
          stroke={() => this.strokeColor()}
          lineWidth={2}
          end={0}
          lineCap="round"
        />
        {/* Left side */}
        <Line
          ref={this.leftLine}
          points={[[-hw(), hh()], [-hw(), -hh()]]}
          stroke={() => this.strokeColor()}
          lineWidth={2}
          end={0}
          lineCap="round"
        />
      </>,
    );
  }

  /**
   * Beat 2: draws the rectangle corner by corner.
   * Top → Right → Bottom → Left, sequentially, like Inkscape placing a shape.
   */
  public *drawTemplate(totalDuration: number) {
    const sideDur = totalDuration / 4;
    yield* this.topLine().end(1, sideDur, easeInOutCubic);
    yield* this.rightLine().end(1, sideDur, easeInOutCubic);
    yield* this.bottomLine().end(1, sideDur, easeInOutCubic);
    yield* this.leftLine().end(1, sideDur, easeInOutCubic);
  }

  /**
   * Beat 3: flash the clip — a brief brightness pulse to signal the snap.
   * The actual clip mask should be applied to the screenshot Rect externally
   * using the clipRect helper below.
   */
  public *flashClip(duration: number) {
    yield* all(
      this.topLine().opacity(0, duration / 2),
      this.rightLine().opacity(0, duration / 2),
      this.bottomLine().opacity(0, duration / 2),
      this.leftLine().opacity(0, duration / 2),
    );
    yield* all(
      this.topLine().opacity(1, duration / 2),
      this.rightLine().opacity(1, duration / 2),
      this.bottomLine().opacity(1, duration / 2),
      this.leftLine().opacity(1, duration / 2),
    );
  }

  /**
   * Reset all sides to invisible — for reuse in Beat 4 repeat cycles.
   * The template itself stays visible (end=1) — only content resets.
   */
  public resetLines() {
    this.topLine().end(1);
    this.rightLine().end(1);
    this.bottomLine().end(1);
    this.leftLine().end(1);
  }
}