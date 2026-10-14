/** Crowns: gold, silver and bronze for the world's top 3, the country crown (green gem) for each country's #1. */
export type CrownKind = 'gold' | 'silver' | 'bronze' | 'country';
export const CROWNS: CrownKind[] = ['gold', 'silver', 'bronze', 'country'];

export const CROWN_COLORS: Record<CrownKind, { base: string; hi: string; edge: string; gem: string }> = {
  gold: { base: '#F7B52C', hi: '#FFE27A', edge: '#9A5B10', gem: '#FF5C7A' },
  silver: { base: '#BCC8D6', hi: '#F3F7FB', edge: '#5B6878', gem: '#5BB6FF' },
  bronze: { base: '#D98A4E', hi: '#F7C79C', edge: '#7A3F17', gem: '#FFD166' },
  country: { base: '#F7B52C', hi: '#FFE27A', edge: '#9A5B10', gem: '#33C26B' },
};

/** World top 3 wear gold, silver and bronze; every other country's #1 wears the country crown. */
export function crownFor(worldRank: number, countryRank: number): CrownKind | null {
  if (worldRank === 1) return 'gold';
  if (worldRank === 2) return 'silver';
  if (worldRank === 3) return 'bronze';
  return countryRank === 1 ? 'country' : null;
}

/** A chunky three-point crown, 120 × 90. */
export function crownSvg(kind: CrownKind) {
  const c = CROWN_COLORS[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" width="120" height="90">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.hi}"/><stop offset="1" stop-color="${c.base}"/></linearGradient></defs>
<path d="M16 70 L10 28 L37 47 L60 14 L83 47 L110 28 L104 70 Z" fill="url(#g)" stroke="${c.edge}" stroke-width="5" stroke-linejoin="round"/>
<rect x="13" y="64" width="94" height="17" rx="7" fill="${c.base}" stroke="${c.edge}" stroke-width="5"/>
<circle cx="10" cy="26" r="8" fill="${c.hi}" stroke="${c.edge}" stroke-width="4"/>
<circle cx="60" cy="12" r="9" fill="${c.hi}" stroke="${c.edge}" stroke-width="4"/>
<circle cx="110" cy="26" r="8" fill="${c.hi}" stroke="${c.edge}" stroke-width="4"/>
<circle cx="60" cy="50" r="9" fill="${c.gem}" stroke="${c.edge}" stroke-width="3.5"/>
<circle cx="57" cy="47" r="3" fill="#fff" opacity="0.75"/>
<circle cx="35" cy="72.5" r="4" fill="${c.gem}"/><circle cx="85" cy="72.5" r="4" fill="${c.gem}"/>
<path d="M27 58 L23 38" stroke="#fff" stroke-opacity="0.55" stroke-width="5" stroke-linecap="round"/>
</svg>`;
}

/** The four crowns side by side in one 1024 × 256 canvas, for the globe. */
export async function crownAtlas(): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  await Promise.all(CROWNS.map((kind, index) => new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      // 120 × 90 drawn 224 × 168, resting on the bottom of its 256 px cell.
      ctx.drawImage(image, index * 256 + 16, 256 - 168 - 8, 224, 168);
      resolve();
    };
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(crownSvg(kind))}`;
  })));
  return canvas;
}
