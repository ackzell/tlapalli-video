import { Rect, Txt, Node, NodeProps, initial, signal } from "@motion-canvas/2d";
import { createSignal, SignalValue, SimpleSignal, TimingFunction } from "@motion-canvas/core";
import { BASE, GemMode, GemName, palette } from "../styles/palette";
import { Gem } from "./Gem";

export interface GemSwatchProps extends NodeProps {
  gem?: SignalValue<GemName>;
  mode?: SignalValue<GemMode>;
  gemName?: SignalValue<string>;
  labelOpacity?: SignalValue<number>;
}

export class GemSwatch extends Node {
  @initial("obsidian")
  @signal()
  declare public readonly gem: SimpleSignal<GemName, this>;

  @initial(0)
  @signal()
  declare public readonly mode: SimpleSignal<GemMode, this>;

  @initial("Gem")
  @signal()
  declare public readonly gemName: SimpleSignal<string, this>;

  @initial(1)
  @signal()
  declare public readonly labelOpacity: SimpleSignal<number, this>;

  public constructor(props?: GemSwatchProps) {
    super(props ?? {});

    const SWATCH_W = 108;
    const SWATCH_H = 126;

    this.add(
      <Rect
        layout
        direction="column"
        width={SWATCH_W}
        height={SWATCH_H}
        fill="#00000000"
        lineWidth={0}
        alignItems="center"
        justifyContent="center"
        gap={10}
      >
        <Rect width={72} height={62} fill="#00000000" lineWidth={0}>
          <Gem gem={() => this.gem()} mode={() => this.mode()} size={31} />
        </Rect>
        <Txt
          text={() => this.gemName()}
          fontSize={20}
          fill={() => palette[this.gem()][this.mode() === 1 ? "light" : "dark"].mid}
          fontFamily={BASE.mono}
          opacity={() => this.labelOpacity()}
          textAlign="center"
          maxWidth={96}
          textWrap
        />
      </Rect>,
    );
  }
}
