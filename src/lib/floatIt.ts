import { Node } from '@motion-canvas/2d';
import { loop, tween, linear } from '@motion-canvas/core';

interface FloatConfig {
  amplitude?: number;  // how many px up/down, default 10
  period?:    number;  // seconds per full cycle, default 2
  phase?:     number;  // radians offset, default 0
}

export function* floatIt(
  node: Node,
  config: FloatConfig = {},
) {
  const {
    amplitude = 10,
    period    = 5,
    phase     = 0,
  } = config;

  yield* loop(Infinity, function* () {
    yield* tween(period, t => {
      node.position.y(Math.sin(t * Math.PI * 2 + phase) * amplitude);
    });
  });
}