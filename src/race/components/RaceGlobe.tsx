import { useEffect, useRef } from 'react';
import { GlobeScene, type BlobSpec, type GlobeHit, type Look } from '../globe/scene';
import type { Territory } from '../globe/territory';
import type { TileSet } from '../globe/tiles';

export interface FlyRequest { id: number; dir: [number, number, number]; radius: number; instant?: boolean; seconds?: number }

interface Props {
  crowns: HTMLCanvasElement;
  tiles: TileSet | null;
  territory: Territory | null;
  ownerKeys: Int32Array;
  land: [number, number, number][];
  accent: [number, number, number][];
  tones: ([number, number, number] | null)[];
  blobs: BlobSpec[];
  meOwner: number;
  focusShape: number;
  focusOwner: number;
  look: Look;
  tagLimit: number;
  insets: { top: number; right: number; bottom: number };
  fly: FlyRequest | null;
  onPick: (hit: GlobeHit | null) => void;
  /** Text for the hover card, or null for none. */
  describe: (hit: GlobeHit) => { title: string; lines: string[] } | null;
}

/** The three.js globe, kept outside React's render loop: props are pushed into the scene when they change. */
export function RaceGlobe(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const scene = useRef<GlobeScene | null>(null);
  const latest = useRef(props);
  useEffect(() => { latest.current = props; });

  useEffect(() => {
    if (!host.current || !overlay.current) return;
    let lastKey = '';
    const instance = new GlobeScene(host.current, overlay.current, props.crowns, {
      onPick: hit => latest.current.onPick(hit),
      onHover: (hit, x, y) => {
        const el = tip.current;
        if (!el) return;
        if (!hit) { el.hidden = true; lastKey = ''; return; }
        const key = `${hit.tile}:${hit.owner}`;
        if (key !== lastKey) {
          lastKey = key;
          const text = latest.current.describe(hit);
          if (!text) { el.hidden = true; return; }
          const [title, ...rest] = el.children as unknown as HTMLElement[];
          title.textContent = text.title;
          rest.forEach((line, index) => { line.textContent = text.lines[index] ?? ''; line.hidden = !text.lines[index]; });
        }
        el.hidden = false;
        const box = host.current!.getBoundingClientRect();
        const left = Math.min(x - box.left + 16, box.width - el.offsetWidth - 8);
        const top = Math.min(y - box.top + 16, box.height - el.offsetHeight - 8);
        el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
      },
    });
    scene.current = instance;
    return () => { instance.dispose(); scene.current = null; };
  }, [props.crowns]);

  useEffect(() => { scene.current?.setLook(props.look); }, [props.look, props.crowns]);
  useEffect(() => { scene.current?.setInsets(props.insets.top, props.insets.right, props.insets.bottom); }, [props.insets.top, props.insets.right, props.insets.bottom, props.crowns]);
  useEffect(() => { scene.current?.setTagLimit(props.tagLimit); }, [props.tagLimit, props.crowns]);
  useEffect(() => { if (props.tiles) scene.current?.setTiles(props.tiles); }, [props.tiles, props.crowns]);
  useEffect(() => {
    if (props.territory && props.territory.tileSet === props.tiles) scene.current?.setTerritory(props.territory.owner, props.ownerKeys, props.land, props.accent, props.tones, props.meOwner, props.blobs);
  }, [props.territory, props.tiles, props.ownerKeys, props.land, props.accent, props.tones, props.meOwner, props.blobs, props.crowns]);
  useEffect(() => { scene.current?.setFocus(props.focusShape, props.focusOwner); }, [props.focusShape, props.focusOwner, props.territory, props.crowns]);
  useEffect(() => {
    if (props.fly) scene.current?.flyTo(props.fly.dir, props.fly.radius, props.fly.instant ? 0 : props.fly.seconds ?? 1.5);
  }, [props.fly]);

  return (
    <div className="rc-globe" ref={host}>
      <div className="rc-tags" ref={overlay} aria-hidden="true" />
      <div className="rc-tip" ref={tip} hidden role="status">
        <b />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
