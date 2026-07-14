import { Circle, Txt, Node, NodeProps, initial, signal } from "@motion-canvas/2d";
import { SignalValue, SimpleSignal } from "@motion-canvas/core";
import { BASE, GemName, palette } from "../styles/palette";
import { Gem } from "./Gem";

export interface TimelineDotProps extends NodeProps {
  gemColor?: SignalValue<GemName>;
  label?: SignalValue<string>;
  labelBelow?: SignalValue<boolean>;
}

/**
 * TimelineDot — a small gem-colored circle with a label.
 * Used in Scene 13 to mark points on the story timeline.
 *
 * Usage:
 *   <TimelineDot gemColor="jade" label="first tint" scale={0} />
 *   yield* dot().scale(1, 0.3, easeOutBack);
 */
export class TimelineDot extends Node {
  @initial("jade")
  @signal()
  declare public readonly gemColor: SimpleSignal<GemName, this>;

  @initial("event")
  @signal()
  declare public readonly label: SimpleSignal<string, this>;

  @initial(true)
  @signal()
  declare public readonly labelBelow: SimpleSignal<boolean, this>;

  public constructor(props?: TimelineDotProps) {
    super(props ?? {});

    this.add(
      <>
        <Gem
          gem={() => this.gemColor()}
          size={14}
          shadowColor={() => palette[this.gemColor()]["dark"].fg}
          shadowBlur={10}
        />
        <Txt
          text={() => this.label()}
          fontSize={22}
          fill={BASE.textMid}
          fontFamily={BASE.titleFont}
          y={() => (this.labelBelow() ? 45 : -45)}
          textAlign="center"
        />
      </>,
    );
  }
}
