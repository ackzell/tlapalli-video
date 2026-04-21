import { Rect, Txt, Node, NodeProps, initial, signal } from "@motion-canvas/2d";
import { SignalValue, SimpleSignal, createRef, easeInOutCubic } from "@motion-canvas/core";
import { BASE } from "../styles/palette";

export interface EditorWindowProps extends NodeProps {
  accentColor?: SignalValue<string>;
  label?: SignalValue<string>;
  winWidth?: SignalValue<number>;
  winHeight?: SignalValue<number>;
  showPlaceholderContent?: SignalValue<boolean>;
  bodyFill?: SignalValue<string>;
  placeholderBaseOpacity?: SignalValue<number>;
  extraPlaceholderLines?: SignalValue<number>;
}

/**
 * EditorWindow - a simplified VSCode-style window.
 */
export class EditorWindow extends Node {
  @initial("#5c5c5c")
  @signal()
  declare public readonly accentColor: SimpleSignal<string, this>;

  @initial("repo/")
  @signal()
  declare public readonly label: SimpleSignal<string, this>;

  @initial(480)
  @signal()
  declare public readonly winWidth: SimpleSignal<number, this>;

  @initial(300)
  @signal()
  declare public readonly winHeight: SimpleSignal<number, this>;

  @initial(true)
  @signal()
  declare public readonly showPlaceholderContent: SimpleSignal<boolean, this>;

  @initial(BASE.surface)
  @signal()
  declare public readonly bodyFill: SimpleSignal<string, this>;

  @initial(0.2)
  @signal()
  declare public readonly placeholderBaseOpacity: SimpleSignal<number, this>;

  @initial(0)
  @signal()
  declare public readonly extraPlaceholderLines: SimpleSignal<number, this>;

  private readonly titleBarRef = createRef<Rect>();
  private readonly bodyRef = createRef<Rect>();
  private readonly labelRef = createRef<Txt>();

  public constructor(props?: EditorWindowProps) {
    super(props ?? {});

    const totalHeight = () => 32 + this.winHeight();
    const titleY = () => -totalHeight() / 2 + 16;
    const bodyY = () => -totalHeight() / 2 + 32 + this.winHeight() / 2;
    const bodyTop = () => -totalHeight() / 2 + 66;

    this.add(
      <Rect
        stroke={this.accentColor()}
        lineWidth={1}
        width={() => this.winWidth()}
        height={totalHeight}
        radius={6}
        clip
      >
        <Rect
          ref={this.titleBarRef}
          width={() => this.winWidth()}
          height={32}
          y={titleY}
          fill={this.bodyFill()}
          radius={[6, 6, 0, 0]}
          opacity={1}
          lineWidth={0}
        >
          <Rect width={10} height={10} radius={5} x={-this.winWidth() / 2 + 20} fill="#ffffff33" />
          <Rect width={10} height={10} radius={5} x={-this.winWidth() / 2 + 36} fill="#ffffff33" />
          <Rect width={10} height={10} radius={5} x={-this.winWidth() / 2 + 52} fill="#ffffff33" />
          <Txt
            ref={this.labelRef}
            text={() => this.label()}
            fontSize={11}
            fill={() => this.accentColor()}
            fontFamily={BASE.mono}
            x={-this.winWidth() / 2 + 120}
          />
        </Rect>

        <Rect
          ref={this.bodyRef}
          width={() => this.winWidth()}
          height={() => this.winHeight()}
          y={bodyY}
          fill={this.bodyFill()}
          radius={[0, 0, 6, 6]}
        />

        {this.showPlaceholderContent()
          ? [
              ...[0.4, 0.7, 0.3, 0.6, 0.5, 0.8, 0.35, 0.65],
              ...Array.from(
                { length: Math.max(0, this.extraPlaceholderLines()) },
                (_, i) => 0.24 + ((i * 19) % 54) / 100,
              ),
            ].map((w, i) => (
              <Rect
                width={() => this.winWidth() * w * 0.7}
                height={8}
                radius={2}
                fill={() => this.accentColor()}
                opacity={() => this.placeholderBaseOpacity() + i * 0.02}
                x={() => -this.winWidth() / 2 + 40 + (this.winWidth() * w * 0.7) / 2}
                y={() => bodyTop() + 20 + i * 14}
              />
            ))
          : null}
      </Rect>,
    );
  }

  public *tweenAccent(color: string, duration: number) {
    yield* this.accentColor(color, duration, easeInOutCubic);
  }
}
