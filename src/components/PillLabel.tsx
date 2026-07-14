import { Layout, Rect, Txt, Node, NodeProps, initial, signal } from "@motion-canvas/2d";
import { SignalValue, SimpleSignal } from "@motion-canvas/core";
import { BASE } from "../styles/palette";

export interface PillLabelProps extends NodeProps {
  text?: SignalValue<string>;
  accentColor?: SignalValue<string>;
}

/**
 * PillLabel — a monospace pill tag used for labels and callouts.
 *
 * Usage:
 *   <PillLabel text="Same crop. Every time." accentColor="#3d7f7d" opacity={0} />
 *   yield* pill().opacity(1, 0.5);
 */
export class PillLabel extends Node {
  @initial("label")
  @signal()
  declare public readonly text: SimpleSignal<string, this>;

  @initial("#5c5c5c")
  @signal()
  declare public readonly accentColor: SimpleSignal<string, this>;

  public constructor(props?: PillLabelProps) {
    super(props ?? {});

    this.add(
      <Rect
        fill={BASE.surfaceHi}
        stroke={BASE.border}
        lineWidth={1}
        radius={7}
        paddingLeft={16}
        paddingRight={16}
        paddingTop={8}
        paddingBottom={8}
        margin={10}
        layout
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Txt text={() => this.text()} fontSize={46} fill={BASE.textMid} fontFamily={BASE.font} />
      </Rect>,
    );
  }
}
