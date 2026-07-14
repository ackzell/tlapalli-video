import { Node, Path } from "@motion-canvas/2d";
import { NodeProps } from "@motion-canvas/2d/lib/components";

interface SpeechGlyphProps extends NodeProps {}

// Aztec speech glyph (volute) from the codices.
// Paths are pre-flattened into the viewBox space (0 0 45.2 29.1).
// Wrap in a Node and scale it to your desired size, e.g.:
//   <SpeechGlyph scale={10} />
export function SpeechGlyph(props: SpeechGlyphProps) {
  // Body and outline are already in viewBox coords.
  const BODY =
    "M30.945 10.676c4.145.205 3.925 4.94 3.733 2.69-.837-2.787-4.556-3.253-6.739-2.183a6.12 6.12 0 0 0-3.06 4.694C16.78 24.03 1.12 17.387.887 11.403c15.908-.618 18.556-1.4 31.554-6.272 5.531-2.087 12.023 1.852 10.417 9.305a11.67 11.67 0 0 1-4.735 6.89c-12.27 7.631-18.158-10.939-7.178-10.65z";

  // The shadow/sheen paths still live in large-coord space.
  // Their SVG transform is: rotate(-6.5 -1559.862 335.236) scale(.13725)
  // We replicate this with scale + rotation + offsetX/Y on each Path.
  const S = 0.13725;
  const PIVOT_X = -1559.862;
  const PIVOT_Y = 335.236;

  const largeCoordProps = {
    scale: S,
    rotation: -6.5,
    offsetX: PIVOT_X,
    offsetY: PIVOT_Y,
  };

  // ViewBox is "0 0 45.2 29.1" — shift children by half so origin = centre.
  const CX = -45.2 / 2;
  const CY = -29.1 / 2;

  return (
    <Node {...props}>
      <Node x={CX} y={CY}>
        <Path
          data="M31.189 11.190 C35.358 11.406 35.124 16.143 34.936 13.885 C34.093 11.094 30.380 10.633 28.196 11.711 A6.1214 6.1214 -6.50 0 0 25.138 16.397 C17.061 24.555 1.374 17.930 1.148 11.947 C17.044 11.310 19.703 10.524 32.685 5.646 C38.222 3.565 44.720 7.494 43.112 14.957 A11.6663 11.6663 -6.50 0 1 38.384 21.836 C26.117 29.477 20.232 10.919 31.203 11.189 Z"
          fill="#202020"
          shadowColor="rgba(0,0,0,0.6)"
          shadowBlur={2}
        />
        // Body fill
        <Path
          data="M30.945 10.676c4.145.205 3.925 4.94 3.733 2.69-.837-2.787-4.556-3.253-6.739-2.183a6.12 6.12 0 0 0-3.06 4.694C16.78 24.03 1.12 17.387.887 11.403c15.908-.618 18.556-1.4 31.554-6.272 5.531-2.087 12.023 1.852 10.417 9.305a11.67 11.67 0 0 1-4.735 6.89c-12.27 7.631-18.158-10.939-7.178-10.65z"
          fill="#f9f9f9"
          stroke="#8d8d8d"
          lineWidth={0.68625}
          lineCap="round"
        />
        // Curl sheen
        <Path
          data="M35.658 18.886 C35.708 20.538 33.311 23.381 30.774 22.938 C27.912 22.435 24.871 18.416 24.851 15.697 C28.031 8.566 32.494 11.000 28.579 13.380 C26.485 14.641 28.663 20.664 31.491 19.168 C35.069 16.509 35.508 15.505 35.658 18.886"
          fill="#d0d0d0"
          opacity={0.5}
        />
        // Tail sheen
        <Path
          data="M42.608 10.290 C46.075 16.470 35.769 27.010 29.063 21.986 C28.530 17.309 36.968 20.326 37.629 14.725 C36.727 6.208 42.316 8.582 42.608 10.290"
          fill="#d0d0d0"
          opacity={0.4}
        />
        // Belly sheen
        <Path
          data="M2.301 11.885 C2.301 11.885 9.174 16.917 14.845 16.133 C20.502 15.350 26.146 11.419 26.146 11.419 L24.885 15.873 C17.842 23.403 0.204 18.091 2.301 11.885"
          fill="#d0d0d0"
          opacity={0.4}
        />
        // Dark outline
        <Path
          data="M30.945 10.676c4.145.205 3.925 4.94 3.733 2.69-.837-2.787-4.556-3.253-6.739-2.183a6.12 6.12 0 0 0-3.06 4.694C16.78 24.03 1.12 17.387.887 11.403c15.908-.618 18.556-1.4 31.554-6.272 5.531-2.087 12.023 1.852 10.417 9.305a11.67 11.67 0 0 1-4.735 6.89c-12.27 7.631-18.158-10.939-7.178-10.65z"
          fill="rgba(0,0,0,0)"
          stroke="#424242"
          lineWidth={1.18035}
          lineCap="round"
        />
      </Node>
    </Node>
  );
}
