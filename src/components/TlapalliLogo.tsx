import {Node, NodeProps, Path, initial, signal} from '@motion-canvas/2d';
import {SignalValue, SimpleSignal} from '@motion-canvas/core';
import {GemMode, GemName, palette} from '../styles/palette';

export interface TlapalliLogoProps extends NodeProps {
  mode?: SignalValue<GemMode>;
  gemSize?: SignalValue<number>;
}

interface GemDef {
  variant: GemName;
  outer: string;
  highlight: string;
  facet: string;
  outerStrokeWidth: number;
}

interface NormalizedGemDef {
  variant: GemName;
  outer: string;
  highlight: string;
  facet: string;
  offsetX: number;
  offsetY: number;
  outerStrokeWidth: number;
}

type Point = [number, number];

const VIEWBOX_SIZE = 344;
const VIEWBOX_HALF = VIEWBOX_SIZE / 2;

const SATELLITE_GEMS: GemDef[] = [
  {
    variant: 'lapisLazuli',
    outer: '231.1,296.3 201.4,296.3 182.9,273.1 189.5,244.1 216.2,231.2 243,244.1 249.6,273.1',
    highlight: '227.5,288.8 205,288.8 191,271.3 196,249.4 216.2,239.6 236.5,249.3 241.5,271.2',
    facet: '216.2,286.2 205.1,288.8 200.1,278.4 191.1,271.3 196.1,260.9 196.1,249.5 207.3,246.9 216.2,239.8 225.2,246.9 236.4,249.5 236.4,261 241.4,271.3 232.4,278.5 227.4,288.8',
    outerStrokeWidth: 1.2,
  },
  {
    variant: 'amethyst',
    outer: '112.1,296.4 93.6,273.2 100.2,244.2 126.9,231.3 153.7,244.2 160.3,273.1 141.8,296.4',
    highlight: '115.7,288.9 101.7,271.3 106.7,249.4 126.9,239.6 147.2,249.4 152.2,271.3 138.2,288.8',
    facet: '110.7,278.5 101.8,271.3 106.8,261 106.8,249.5 118,246.9 126.9,239.8 135.9,247 147,249.5 147,261 152,271.3 143,278.5 138.1,288.8 126.9,286.3 115.7,288.8',
    outerStrokeWidth: 1.2,
  },
  {
    variant: 'gold',
    outer: '171.5,35.6 198.3,48.5 204.9,77.5 186.4,100.7 156.7,100.7 138.2,77.5 144.8,48.5',
    highlight: '171.5,44 191.8,53.7 196.8,75.6 182.8,93.2 160.3,93.2 146.3,75.6 151.3,53.7',
    facet: '180.6,51.1 191.7,53.7 191.7,65.2 196.7,75.5 187.7,82.7 182.7,93 171.5,90.5 160.4,93 155.4,82.6 146.5,75.5 151.4,65.1 151.4,53.7 162.6,51.1 171.6,44',
    outerStrokeWidth: 1.2,
  },
  {
    variant: 'turquoise',
    outer: '278.8,87.2 285.4,116.2 266.9,139.4 237.2,139.4 218.6,116.2 225.2,87.2 252,74.3',
    highlight: '272.2,92.4 277.2,114.3 263.2,131.9 240.8,131.9 226.8,114.3 231.8,92.4 252,82.7',
    facet: '272.2,104 277.2,114.3 268.2,121.4 263.2,131.8 252,129.2 240.9,131.8 235.9,121.4 226.9,114.3 231.9,103.9 231.9,92.5 243.1,89.9 252.1,82.8 261.1,89.9 272.2,92.5',
    outerStrokeWidth: 1.2,
  },
  {
    variant: 'quartz',
    outer: '305.3,203.3 286.8,226.5 257.1,226.5 238.5,203.3 245.1,174.3 271.9,161.4 298.7,174.3',
    highlight: '297.1,201.4 283.1,219 260.7,219 246.7,201.4 251.7,179.5 271.9,169.8 292.1,179.5',
    facet: '288.1,208.6 283.2,218.9 271.9,216.3 260.8,218.9 255.8,208.5 246.8,201.4 251.8,191.1 251.8,179.6 263,177.1 272,169.9 280.9,177.1 292.1,179.6 292.1,191.1 297.1,201.4',
    outerStrokeWidth: 1.2,
  },
  {
    variant: 'jade',
    outer: '37.8,203.4 44.4,174.4 71.2,161.5 98,174.4 104.6,203.3 86.1,226.6 56.4,226.6',
    highlight: '46,201.5 51,179.6 71.2,169.9 91.4,179.6 96.5,201.5 82.5,219.1 60,219.1',
    facet: '51,191.1 51,179.7 62.2,177.1 71.1,170 80.1,177.1 91.3,179.7 91.3,191.1 96.3,201.5 87.3,208.6 82.3,218.9 71.1,216.4 60,218.9 55,208.6 46,201.5',
    outerStrokeWidth: 1.2,
  },
  {
    variant: 'fireOpal',
    outer: '64.2,87.3 91,74.4 117.8,87.3 124.4,116.3 105.9,139.5 76.2,139.5 57.6,116.3',
    highlight: '70.8,92.5 91,82.8 111.2,92.5 116.3,114.4 102.3,132 79.8,132 65.8,114.4',
    facet: '82,90 90.9,82.8 99.9,90 111.1,92.5 111.1,104 116.1,114.3 107.1,121.5 102.2,131.8 91,129.3 79.8,131.8 74.8,121.5 65.9,114.3 70.8,104 70.8,92.5',
    outerStrokeWidth: 1.2,
  },
];

const OBSIDIAN_GEM: GemDef = {
  variant: 'obsidian',
  outer: '172,227.2 216.2,206.4 227.1,159.7 196.5,122.2 147.5,122.2 116.9,159.7 127.8,206.4',
  highlight: '172,213.7 205.4,198 213.7,162.7 190.6,134.4 153.4,134.4 130.3,162.7 138.6,198',
  facet: '187.2,202.5 205.5,198 205.9,179.5 213.7,162.7 199.2,150.9 190.6,134.5 172.1,138.2 153.6,134.5 145,151 130.6,162.8 138.4,179.6 138.9,198.1 157.2,202.6 172.2,213.7',
  outerStrokeWidth: 1.2,
};

const STAR_PATH = 'm -138.2877,-201.38045 13.486,64.67357 -26.74876,32.74693 -65.4093,1.23103 61.58072,31.09631 8.64558,36.97912 -42.14782,54.94132 67.3782,-30.89986 28.3634,13.33502 17.94249,72.31263 17.95388,-72.35657 28.31001,-13.31026 67.42073,30.91904 -42.21127,-55.02405 8.61499,-36.84884 61.67422,-31.14385 -65.49358,-1.23249 -26.68184,-32.66451 13.50323,-64.75478 -41.76656,50.39799 h -42.64767 z m 39.00802,80.33773 48.08589,0 30.60433,37.46696 -10.92285,46.72067 -44.22469,20.79305 -44.22469,-20.79305 -10.92285,-46.72067 z';

function toPath(points: string) {
  const pairs = points.trim().split(' ');
  const cmds = pairs.map((pair, index) => {
    const [x, y] = pair.split(',').map(Number);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  });

  return `${cmds.join(' ')} Z`;
}

function parsePoints(points: string): Point[] {
  return points
    .trim()
    .split(' ')
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return [x, y];
    });
}

function pointsToPath(points: Point[]): string {
  const cmds = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`);
  return `${cmds.join(' ')} Z`;
}

function normalizeGem(def: GemDef): NormalizedGemDef {
  const outerPoints = parsePoints(def.outer);
  const minX = Math.min(...outerPoints.map(([x]) => x));
  const maxX = Math.max(...outerPoints.map(([x]) => x));
  const minY = Math.min(...outerPoints.map(([, y]) => y));
  const maxY = Math.max(...outerPoints.map(([, y]) => y));

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const shift = (raw: string) =>
    parsePoints(raw).map(([x, y]) => [x - cx, y - cy] as Point);

  return {
    variant: def.variant,
    outer: pointsToPath(shift(def.outer)),
    highlight: pointsToPath(shift(def.highlight)),
    facet: pointsToPath(shift(def.facet)),
    offsetX: cx - VIEWBOX_HALF,
    offsetY: cy - VIEWBOX_HALF,
    outerStrokeWidth: def.outerStrokeWidth,
  };
}

const NORMALIZED_SATELLITE_GEMS = SATELLITE_GEMS.map((gem) => normalizeGem(gem));
const NORMALIZED_OBSIDIAN_GEM = normalizeGem(OBSIDIAN_GEM);

export class TlapalliLogo extends Node {
  @initial('dark')
  @signal()
  public declare readonly mode: SimpleSignal<GemMode, this>;

  @initial(26)
  @signal()
  public declare readonly gemSize: SimpleSignal<number, this>;

  public constructor(props?: TlapalliLogoProps) {
    super(props ?? {});

    const scale = () => this.gemSize() / 86;

    // Star backdrop
    this.add(
      <Path
        layout={false}
        data={STAR_PATH}
        x={() => (247.177 - VIEWBOX_HALF) * scale()}
        y={() => (243.651 - VIEWBOX_HALF) * scale()}
        scale={scale}
        fill={() => palette.obsidian[this.mode()].border}
        stroke={() => palette.obsidian[this.mode()].fg}
        lineWidth={() => Math.max(0.8, 2.2 * scale())}
        opacity={0.38}
      />,
    );

    // Render all gems (satellites + center obsidian) as flat add() calls
    const allGems = [...NORMALIZED_SATELLITE_GEMS, NORMALIZED_OBSIDIAN_GEM];

    for (const gem of allGems) {
      this.add(
        <Path
          layout={false}
          data={gem.outer}
          x={() => gem.offsetX * scale()}
          y={() => gem.offsetY * scale()}
          scale={scale}
          fill={() => palette[gem.variant][this.mode()].bg}
          stroke={() => palette[gem.variant][this.mode()].fg}
          lineWidth={() => gem.outerStrokeWidth * scale() * 1.8}
        />,
      );
      this.add(
        <Path
          layout={false}
          data={gem.highlight}
          x={() => gem.offsetX * scale()}
          y={() => gem.offsetY * scale()}
          scale={scale}
          fill={() => palette[gem.variant][this.mode()].fg}
          lineWidth={0}
        />,
      );
      this.add(
        <Path
          layout={false}
          data={gem.facet}
          x={() => gem.offsetX * scale()}
          y={() => gem.offsetY * scale()}
          scale={scale}
          fill={() => palette[gem.variant][this.mode()].mid}
          lineWidth={0}
        />,
      );
    }
  }
}
