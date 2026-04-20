import { Circle, Txt, Node, NodeProps, initial, signal } from '@motion-canvas/2d';
import { SignalValue, SimpleSignal } from '@motion-canvas/core';
import { BASE } from '../styles/palette';

export interface TimelineDotProps extends NodeProps {
  dotColor?: SignalValue<string>;
  label?: SignalValue<string>;
  labelBelow?: SignalValue<boolean>;
}

/**
 * TimelineDot — a small gem-colored circle with a label.
 * Used in Scene 13 to mark points on the story timeline.
 *
 * Usage:
 *   <TimelineDot dotColor="#80684e" label="first tint" scale={0} />
 *   yield* dot().scale(1, 0.3, easeOutBack);
 */
export class TimelineDot extends Node {
  @initial('#5c5c5c')
  @signal()
  public declare readonly dotColor: SimpleSignal<string, this>;

  @initial('event')
  @signal()
  public declare readonly label: SimpleSignal<string, this>;

  @initial(true)
  @signal()
  public declare readonly labelBelow: SimpleSignal<boolean, this>;

  public constructor(props?: TimelineDotProps) {
    super(props);

    this.add(
      <>
        <Circle
          size={14}
          fill={() => this.dotColor()}
          shadowColor={() => this.dotColor()}
          shadowBlur={10}
        />
        <Txt
          text={() => this.label()}
          fontSize={11}
          fill={BASE.textMid}
          fontFamily={BASE.font}
          y={() => this.labelBelow() ? 22 : -22}
          textAlign="center"
        />
      </>,
    );
  }
}