import { Rect, Txt, Node, NodeProps, initial, signal } from '@motion-canvas/2d';
import { SignalValue, SimpleSignal } from '@motion-canvas/core';
import { BASE, GemMode, GemName, palette } from '../styles/palette';
import { Gem } from './Gem';

export interface GemSwatchProps extends NodeProps {
  gem?: SignalValue<GemName>;
  mode?: SignalValue<GemMode>;
  gemName?: SignalValue<string>;
}

export class GemSwatch extends Node {
  @initial('obsidian')
  @signal()
  public declare readonly gem: SimpleSignal<GemName, this>;

  @initial('dark')
  @signal()
  public declare readonly mode: SimpleSignal<GemMode, this>;

  @initial('Gem')
  @signal()
  public declare readonly gemName: SimpleSignal<string, this>;

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
          <Gem
            gem={() => this.gem()}
            mode={() => this.mode()}
            size={31}
          />
        </Rect>
        <Txt
          text={() => this.gemName()}
          fontSize={12}
          fill={() => palette[this.gem()][this.mode()].mid}
          fontFamily={BASE.mono}
          textAlign="center"
          maxWidth={96}
          textWrap
        />
      </Rect>,
    );
  }
}