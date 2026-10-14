import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildGrid, vecToLatLng } from './grid';
import type { LandMode } from '../landColors';
import { tileAt, type TileSet } from './tiles';

/** Look settings the sandbox panel can change live. */
export interface Look {
  /** How land is coloured (see landColors.ts). */
  landMode: LandMode;
  /** Gap between territories, as a share of a tile. */
  tileGap: number;
  tileHeight: number;
  autoRotate: number;
  blobScale: number;
  /** A blob gets a name tag once it is this many pixels tall. */
  tagPx: number;
  oceanGrid: boolean;
  atmosphere: number;
  wobble: boolean;
}

export const DEFAULT_LOOK: Look = { landMode: 'pastel', tileGap: 0.14, tileHeight: 0.006, autoRotate: 0.35, blobScale: 1, tagPx: 30, oceanGrid: true, atmosphere: 1, wobble: true };

export interface GlobeHit { tile: number; shape: number; owner: number }

export interface BlobSpec {
  key: string;
  owner: number;
  tile: number;
  /** Height in globe radii (fits the walker's land), and the smallest it may look on screen, in pixels. */
  size: number;
  minPx: number;
  rgb: [number, number, number];
  shape: [number, number, number, number];
  /** eyes, mouth, blush (0/1), squash. */
  face: [number, number, number, number];
  /** Crown slot in the crown atlas, or -1. */
  crown: number;
  /** Always tagged when on screen (you, the selected walker). */
  pinned: boolean;
  label: { title: string; sub: string; extra: string; tone: 'gold' | 'me' | 'plain' } | null;
}

interface TagState { el: HTMLDivElement; key: string; size: [number, number] }

const TEX_W = 256;
const UNCLAIMED: [number, number, number] = [66, 76, 112];
const ICE: [number, number, number] = [150, 164, 196];
const EARTH_KM = 6371;
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reads a tile's state (raise, flash, dim, appear) and lifts a point to the top of that tile.
const tileLift = /* glsl */ `
  uniform highp sampler2D uState;
  uniform float uTileH;
  uniform float uRaiseH;
  vec4 tileState(float tile) {
    int ti = int(tile + 0.5);
    return texelFetch(uState, ivec2(ti % ${TEX_W}, ti / ${TEX_W}), 0);
  }
  float tileTop(vec4 st) {
    return 1.0 + uTileH * (0.4 + 0.6 * st.w) + st.x * uRaiseH + st.y * uRaiseH * 0.35;
  }
`;

const tileVertex = /* glsl */ `
  attribute float aTile;
  attribute float aTop;
  attribute float aRim;
  attribute float aShade;
  attribute float aHexR;
  uniform highp sampler2D uTone;
  uniform highp sampler2D uColor;
  ${tileLift}
  varying vec3 vColor;
  varying vec3 vNormal;
  varying float vRim;
  varying float vTop;
  varying float vShade;
  varying vec4 vState;
  varying float vMine;
  varying vec4 vTone;
  varying vec3 vWorld;
  varying float vHexR;
  void main() {
    vec4 st = tileState(aTile);
    int ti = int(aTile + 0.5);
    vec4 col = texelFetch(uColor, ivec2(ti % ${TEX_W}, ti / ${TEX_W}), 0);
    float r = mix(0.994, tileTop(st), aTop);
    r = mix(0.985, r, smoothstep(0.0, 1.0, st.w));
    vColor = col.rgb;
    vMine = col.a;
    vState = st;
    vRim = aRim;
    vTop = aTop;
    vShade = aShade;
    vTone = texelFetch(uTone, ivec2(ti % ${TEX_W}, ti / ${TEX_W}), 0);
    vWorld = position * r;
    vHexR = aHexR;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * r, 1.0);
  }
`;

const tileFragment = /* glsl */ `
  uniform vec3 uLight;
  uniform float uTime;
  varying vec3 vColor;
  varying vec3 vNormal;
  varying float vRim;
  varying float vTop;
  varying float vShade;
  varying vec4 vState;
  varying float vMine;
  varying vec4 vTone;
  varying vec3 vWorld;
  varying float vHexR;
  void main() {
    vec3 n = normalize(vNormal);
    float diff = max(dot(n, uLight), 0.0);
    // How big this walker's land is on screen: the hex in pixels times √(their tiles). Small land blends into the
    // country's own colour; each walker's colour comes through once their land is big enough to read.
    float worldPerPx = max(length(fwidth(vWorld)), 1e-7);
    float landPx = (vHexR / worldPerPx) * vTone.a * 16.0;
    float own = smoothstep(10.0, 26.0, landPx);
    vec3 land = mix(vTone.rgb, vColor, own);
    // Your own land breathes softly so you can always find it.
    vec3 base = mix(land, vec3(1.0), vMine * (0.5 + 0.5 * sin(uTime * 3.0)) * 0.25);
    // Soft toy lighting (mostly ambient, a little key light), so pastels stay pastel all the way to the edge.
    vec3 c = base * (0.8 + 0.3 * diff) * vShade;
    // Hex outlines and a light bevel, but only once a hex is big enough on screen to read; smaller, they turn to grain.
    float top = step(0.99, vShade);
    float w = max(fwidth(vRim), 1e-4);
    float hexPx = 1.0 / w;
    float line = smoothstep(1.0 - w * 1.7, 1.0, vRim) * smoothstep(5.0, 12.0, hexPx) * top;
    c = mix(c, c * 0.87, line);
    c += smoothstep(0.7, 0.96, vRim) * (1.0 - line) * smoothstep(9.0, 22.0, hexPx) * top * 0.045 * (0.5 + diff);
    c = mix(c, vec3(1.0, 0.98, 0.92), vState.y * 0.7);
    // Countries outside the one you opened fade toward the sea.
    c = mix(c, vec3(0.2, 0.24, 0.38), vState.z * 0.72);
    c += pow(1.0 - max(n.z, 0.0), 3.0) * vec3(0.12, 0.16, 0.22) * (1.0 - vState.z);
    gl_FragColor = vec4(c, 1.0);
  }
`;

// Shallow water along the coasts: a soft band that fades out to sea.
const coastVertex = /* glsl */ `
  attribute float aFade;
  varying float vFade;
  varying vec3 vNormal;
  void main() {
    vFade = aFade;
    vNormal = normalize(normalMatrix * position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coastFragment = /* glsl */ `
  uniform float uGlow;
  varying float vFade;
  varying vec3 vNormal;
  void main() {
    float a = vFade * vFade * 0.42 * smoothstep(0.0, 0.25, vNormal.z) * uGlow;
    gl_FragColor = vec4(vec3(0.55, 0.86, 0.95), a);
  }
`;

const oceanVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorld = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const oceanFragment = /* glsl */ `
  uniform vec3 uLight;
  uniform float uTime;
  uniform float uGlow;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 n = normalize(vNormal);
    float fres = 1.0 - max(n.z, 0.0);
    vec3 c = mix(vec3(0.045, 0.075, 0.19), vec3(0.1, 0.16, 0.36), pow(fres, 1.4));
    c *= 0.72 + 0.5 * max(dot(n, uLight), 0.0);
    c += sin(vWorld.x * 23.0 + uTime * 0.6) * sin(vWorld.y * 19.0 - uTime * 0.45) * sin(vWorld.z * 21.0 + uTime * 0.3) * 0.012;
    vec3 h = normalize(uLight + vec3(0.0, 0.0, 1.0));
    c += pow(max(dot(n, h), 0.0), 70.0) * vec3(0.35, 0.5, 0.65) * 0.55;
    c += pow(fres, 2.6) * vec3(0.16, 0.42, 0.40) * 0.85 * uGlow;
    gl_FragColor = vec4(c, 1.0);
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform float uGlow;
  varying vec3 vNormal;
  void main() {
    float i = pow(clamp(0.74 + vNormal.z, 0.0, 1.0), 5.0);
    vec3 c = mix(vec3(0.45, 0.72, 1.0), vec3(0.39, 0.84, 0.53), clamp(vNormal.y * 0.5 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(c * i * 0.95 * uGlow, i * uGlow);
  }
`;

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixel;
  varying float vTwinkle;
  void main() {
    vTwinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aPhase * 0.8) + aPhase * 40.0);
    gl_PointSize = aSize * uPixel;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starFragment = /* glsl */ `
  varying float vTwinkle;
  void main() {
    float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vTwinkle;
    gl_FragColor = vec4(vec3(0.85, 0.9, 1.0), a);
  }
`;

// Blobs and crowns stand on their tile as camera-facing cards, pushed a little toward the camera so the curve of the
// globe never cuts them, and never smaller than their minimum size on screen.
const cardVertex = (extra: string) => /* glsl */ `
  attribute float iTile;
  attribute vec3 iDir;
  attribute vec2 iSize;
  ${extra}
  ${tileLift}
  uniform float uFocal;
  uniform float uScale;
  varying vec2 vUv;
  varying float vFade;
  varying float vDim;
  float placeCard(out vec4 mv) {
    vec4 st = tileState(iTile);
    vec3 dir = normalize(iDir);
    mv = modelViewMatrix * vec4(dir * tileTop(st), 1.0);
    vec3 toCam = normalize(-mv.xyz);
    float facing = dot(normalize(normalMatrix * dir), toCam);
    // Never smaller than the minimum on screen, never bigger than ~120 px (so close up the land stays visible).
    float size = clamp(iSize.x * uScale, iSize.y * (-mv.z) / uFocal, max(iSize.y, 120.0) * (-mv.z) / uFocal);
    // Pop in (with a little overshoot) just after the land under it rises.
    float grow = clamp((st.w - 0.35) / 0.65, 0.0, 1.0);
    float x = grow - 1.0;
    size *= grow >= 1.0 ? 1.0 : max(0.0, 1.0 + 2.70158 * x * x * x + 1.70158 * x * x);
    float slope = sqrt(max(0.0, 1.0 - facing * facing)) / max(facing, 0.3);
    mv.xyz += toCam * size * (0.2 + 0.8 * slope);
    vFade = smoothstep(0.06, 0.28, facing) * smoothstep(0.0, 1.0, st.w);
    // People shown only as minimum-size dots (far away, small screens) go a little see-through, so a crowded country
    // still reads as land with people on it rather than a carpet of dots. Leaders (bigger minimum) stay solid.
    float natural = iSize.x * uScale / max(iSize.y * (-mv.z) / uFocal, 1e-6);
    if (iSize.y < 6.0) vFade *= mix(0.5, 1.0, smoothstep(0.3, 1.0, natural));
    vDim = st.z;
    return size;
  }
`;

const blobVertex = /* glsl */ `
  ${cardVertex('attribute vec3 iColor; attribute vec4 iShape; attribute vec4 iFace;')}
  varying vec3 vColor;
  varying vec4 vShape;
  varying vec4 vFace;
  void main() {
    vec4 mv;
    float size = placeCard(mv);
    mv.xy += position.xy * size;
    vUv = position.xy;
    vColor = iColor;
    vShape = iShape;
    vFace = iFace;
    gl_Position = projectionMatrix * mv;
  }
`;

// The same drawing as BlobAvatar.tsx (blob units: x -0.5…0.5, y 0…1), as distance fields.
const blobFragment = /* glsl */ `
  uniform float uTime;
  uniform float uWobble;
  varying vec2 vUv;
  varying float vFade;
  varying float vDim;
  varying vec3 vColor;
  varying vec4 vShape;
  varying vec4 vFace;
  float fill(float d, float aa) { return 1.0 - smoothstep(-aa, aa, d); }
  float ring(vec2 p, vec2 c, float r, float w) { return abs(length(p - c) - r) - w; }
  void main() {
    vec2 uv = vUv;
    float aa = max(fwidth(uv.x) * 0.9, 0.0015);
    // How many pixels wide the blob is: below ~12 px it's drawn as a clean dot (a face that small is just grain).
    float detail = smoothstep(9.0, 16.0, 1.0 / max(fwidth(uv.x), 1e-5));
    vec2 p = vec2(uv.x, (uv.y - 0.46) / vFace.w);
    float ang = atan(p.y, p.x);
    float w = vShape.w;
    float r = 0.40 * (1.0 + vShape.x * cos(2.0 * ang + w * 7.0) + vShape.y * cos(3.0 * ang + w * 11.0) + vShape.z * cos(4.0 * ang + w * 5.0));
    r += uWobble * 0.009 * sin(uTime * 2.4 + w * 40.0 + ang * 3.0);
    float d = length(p) - r;
    float body = fill(d, aa);
    float shadow = (1.0 - smoothstep(0.55, 1.0, length((uv - vec2(0.0, 0.045)) / vec2(0.32, 0.045)))) * 0.35 * detail;
    vec3 base = vColor;
    float light = 1.0 - smoothstep(0.0, 0.62, length(p - vec2(-0.12, 0.13)));
    vec3 col = mix(base * 0.74, min(vec3(1.0), base * 1.05 + 0.2), light * 0.85);
    float edge = smoothstep(-0.04, 0.0, d);
    // Close up: a soft darker outline. Tiny: a light rim instead, so dots read clean on any land colour.
    col = mix(col, mix(vec3(1.0), base * 0.62, detail), edge * mix(0.55, 0.8, detail));
    vec2 hp = mat2(0.91, 0.41, -0.41, 0.91) * (p - vec2(-0.15, 0.2));
    col = mix(col, vec3(1.0), (1.0 - smoothstep(0.7, 1.0, length(hp / vec2(0.09, 0.052)))) * 0.7 * detail);
    float ink = 0.0, white = 0.0, dark = 0.0, tongue = 0.0, blush = 0.0;
    for (int i = 0; i < 2; i++) {
      float s = i == 0 ? -1.0 : 1.0;
      vec2 c = vec2(0.13 * s, 0.50);
      if (vFace.x < 0.5 || (vFace.x > 1.5 && vFace.x < 2.5)) {
        float rr = vFace.x < 0.5 ? 0.046 : 0.06;
        float e = fill(length(uv - c) - rr, aa);
        ink = max(ink, e);
        white = max(white, fill(length(uv - c - vec2(rr * 0.32, rr * 0.36)) - rr * 0.34, aa) * e);
        if (vFace.x > 1.5) white = max(white, fill(length(uv - c + vec2(rr * 0.35, rr * 0.35)) - rr * 0.16, aa) * e);
      } else if (vFace.x < 1.5) {
        ink = max(ink, fill(ring(uv, c - vec2(0.0, 0.018), 0.04, 0.012), aa) * step(c.y - 0.018, uv.y));
      } else {
        ink = max(ink, fill(ring(uv, c + vec2(0.0, 0.012), 0.04, 0.012), aa) * step(uv.y, c.y + 0.012));
      }
      blush = max(blush, fill((length((uv - vec2(0.24 * s, 0.41)) / vec2(0.05, 0.03)) - 1.0) * 0.03, aa) * step(0.5, vFace.z));
    }
    vec2 mc = vec2(0.0, 0.36);
    if (vFace.y < 0.5) {
      ink = max(ink, fill(ring(uv, mc + vec2(0.0, 0.012), 0.044, 0.011), aa) * step(uv.y, mc.y + 0.012));
    } else if (vFace.y < 1.5) {
      dark = fill(length(uv - mc - vec2(0.0, 0.015)) - 0.058, aa) * step(uv.y, mc.y + 0.015);
      tongue = fill((length((uv - vec2(0.0, 0.326)) / vec2(0.03, 0.018)) - 1.0) * 0.02, aa) * dark;
    } else if (vFace.y < 2.5) {
      ink = max(ink, fill(ring(uv, vec2(-0.025, 0.368), 0.025, 0.01), aa) * step(uv.y, 0.368));
      ink = max(ink, fill(ring(uv, vec2(0.025, 0.368), 0.025, 0.01), aa) * step(uv.y, 0.368));
    } else {
      dark = fill((length((uv - vec2(0.0, 0.352)) / vec2(0.026, 0.032)) - 1.0) * 0.028, aa);
    }
    col = mix(col, vec3(1.0, 0.44, 0.57), blush * 0.45 * detail);
    col = mix(col, vec3(0.35, 0.1, 0.1), dark * detail);
    col = mix(col, vec3(1.0, 0.5, 0.56), tongue * detail);
    col = mix(col, vec3(0.137, 0.078, 0.047), ink * detail);
    col = mix(col, vec3(1.0), white * detail);
    float g = dot(col, vec3(0.3, 0.55, 0.15));
    col = mix(col, vec3(g) * vec3(0.55, 0.62, 0.8) * 0.6, vDim * 0.75);
    float alpha = max(body, shadow) * vFade;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(col * (body / max(body, shadow)), alpha);
  }
`;

const crownVertex = /* glsl */ `
  ${cardVertex('attribute float iSlot; attribute float iSquash;')}
  void main() {
    vec4 mv;
    float size = placeCard(mv);
    // On the head: the body's top is at 0.46 + 0.40 × squash of the blob's height.
    float crown = size * 0.5 * smoothstep(0.75, 1.0, tileState(iTile).w);
    mv.xy += vec2(position.x * crown, position.y * crown + size * (0.46 + 0.4 * iSquash - 0.07));
    vUv = vec2((iSlot + position.x + 0.5) / 4.0, position.y);
    gl_Position = projectionMatrix * mv;
  }
`;

const crownFragment = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec2 vUv;
  varying float vFade;
  varying float vDim;
  void main() {
    vec4 t = texture2D(uAtlas, vUv);
    float alpha = t.a * vFade;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(mix(t.rgb, vec3(dot(t.rgb, vec3(0.3, 0.55, 0.15)) * 0.5), vDim * 0.7), alpha);
  }
`;

type Cards = THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial>;

export class GlobeScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.004, 200);
  private controls: OrbitControls;
  private timer = new THREE.Timer();
  private elapsed = 0;
  private frame = 0;
  private disposed = false;
  private look: Look = { ...DEFAULT_LOOK };
  private reduced = reducedMotion();
  private light = new THREE.Vector3(-0.45, 0.55, 0.7).normalize();

  private tiles: TileSet | null = null;
  private stateData = new Float32Array(4);
  private colorData = new Uint8Array(4);
  private toneData = new Uint8Array(4);
  private tones: ([number, number, number] | null)[] = [];
  private stateTex: THREE.DataTexture;
  private colorTex: THREE.DataTexture;
  private toneTex: THREE.DataTexture;
  private tileMaterial: THREE.ShaderMaterial;
  private shapeMeshes: (THREE.Mesh | null)[] = [];
  private tileGroup = new THREE.Group();
  private tileUniforms: Record<string, THREE.IUniform>;
  private oceanUniforms: Record<string, THREE.IUniform>;
  private atmoUniforms: Record<string, THREE.IUniform>;
  private starUniforms: Record<string, THREE.IUniform>;
  private cardUniforms: Record<string, THREE.IUniform>;
  private oceanLines: THREE.LineSegments;
  private coast: THREE.Mesh | null = null;

  private ownerOf = new Int32Array(0);
  private ownerKey = new Int32Array(0);
  /** Each owner's calm land colour and their own (blob) colour, shown on your land, the selected land and on hover. */
  private land: [number, number, number][] = [];
  private accent: [number, number, number][] = [];
  private me = -1;
  /** Tiles per owner (CSR), for repainting one territory. */
  private ownerStart = new Int32Array(1);
  private ownerTiles = new Int32Array(0);
  private raise = new Float32Array(0);
  private raiseTarget = new Float32Array(0);
  private dim = new Float32Array(0);
  private dimTarget = new Float32Array(0);
  private flash = new Float32Array(0);
  /** When each tile starts rising: Infinity = not yet, -10 = done. */
  private appearAt = new Float32Array(0);
  private shown = false;
  private settled = false;
  private focusShape = -1;
  private focusOwner = -1;
  private hoverOwner = -1;

  private blobMesh: Cards;
  private crownMesh: Cards;
  private blobs: BlobSpec[] = [];
  private tags: TagState[] = [];
  private tagLimit = 40;
  private tagAge = 0;
  private lastView = new THREE.Matrix4();

  private flight: { from: THREE.Vector3; to: THREE.Vector3; fromDist: number; toDist: number; start: number; duration: number } | null = null;
  private lastInteraction = -1e9;
  private insets = { top: 0, right: 0, bottom: 0 };
  private pointer = { x: 0, y: 0, inside: false, downX: 0, downY: 0, down: false, moved: false };
  private resizeObserver: ResizeObserver;
  private raycaster = new THREE.Raycaster();
  private sphere = new THREE.Sphere(new THREE.Vector3(), 1.004);
  private host: HTMLElement;
  private overlay: HTMLElement;
  private callbacks: { onHover: (hit: GlobeHit | null, x: number, y: number) => void; onPick: (hit: GlobeHit | null) => void };

  constructor(host: HTMLElement, overlay: HTMLElement, crowns: HTMLCanvasElement,
    callbacks: { onHover: (hit: GlobeHit | null, x: number, y: number) => void; onPick: (hit: GlobeHit | null) => void }) {
    this.host = host;
    this.overlay = overlay;
    this.callbacks = callbacks;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);
    const canvas = this.renderer.domElement;
    canvas.className = 'rc-globe-canvas';
    host.appendChild(canvas);

    // Start far away; the page's first flight glides in while the land grows.
    this.camera.position.set(0, 0.6, 11);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.035;
    this.controls.maxDistance = 14;
    this.controls.rotateSpeed = 0.55;
    this.controls.zoomSpeed = 0.8;
    this.controls.addEventListener('start', () => { this.lastInteraction = performance.now(); this.flight = null; });
    this.controls.addEventListener('change', () => { if (this.pointer.down) this.lastInteraction = performance.now(); });

    this.oceanUniforms = { uLight: { value: this.light }, uTime: { value: 0 }, uGlow: { value: 1 } };
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.ShaderMaterial({ vertexShader: oceanVertex, fragmentShader: oceanFragment, uniforms: this.oceanUniforms })));
    this.atmoUniforms = { uGlow: { value: 1 } };
    this.scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.2, 96, 64), new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex, fragmentShader: atmosphereFragment, uniforms: this.atmoUniforms,
      side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    })));
    this.starUniforms = { uTime: { value: 0 }, uPixel: { value: this.renderer.getPixelRatio() } };
    this.scene.add(this.makeStars());
    this.oceanLines = this.makeOceanGrid();
    this.scene.add(this.oceanLines);

    this.stateTex = new THREE.DataTexture(this.stateData, 1, 1, THREE.RGBAFormat, THREE.FloatType);
    this.colorTex = new THREE.DataTexture(this.colorData, 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
    this.toneTex = new THREE.DataTexture(this.toneData, 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
    this.tileUniforms = {
      uState: { value: this.stateTex }, uColor: { value: this.colorTex }, uTone: { value: this.toneTex }, uTileH: { value: this.look.tileHeight }, uRaiseH: { value: 0.02 },
      uTime: { value: 0 }, uLight: { value: this.light },
    };
    this.tileMaterial = new THREE.ShaderMaterial({ vertexShader: tileVertex, fragmentShader: tileFragment, uniforms: this.tileUniforms });
    this.scene.add(this.tileGroup);

    const atlas = new THREE.CanvasTexture(crowns);
    atlas.colorSpace = THREE.NoColorSpace;
    atlas.anisotropy = 4;
    this.cardUniforms = {
      uState: this.tileUniforms.uState, uTileH: this.tileUniforms.uTileH, uRaiseH: this.tileUniforms.uRaiseH,
      uFocal: { value: 800 }, uScale: { value: 1 }, uTime: { value: 0 }, uWobble: { value: this.reduced ? 0 : 1 }, uAtlas: { value: atlas },
    };
    const card = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
    const makeCards = (vertexShader: string, fragmentShader: string): Cards => {
      const geometry = new THREE.InstancedBufferGeometry();
      geometry.index = card.index;
      geometry.setAttribute('position', card.getAttribute('position'));
      geometry.instanceCount = 0;
      // Alpha-to-coverage gives soft edges without sorting thousands of cards by depth.
      const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: this.cardUniforms, alphaToCoverage: true });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      this.scene.add(mesh);
      return mesh;
    };
    this.blobMesh = makeCards(blobVertex, blobFragment);
    this.crownMesh = makeCards(crownVertex, crownFragment);
    this.crownMesh.renderOrder = 2;

    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();
    this.frame = requestAnimationFrame(this.tick);
    // Handy in the console while designing: window.__globe.distance().
    if (import.meta.env.DEV) (window as unknown as { __globe?: GlobeScene }).__globe = this;
  }

  private makeStars() {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      const u = random() * 2 - 1, theta = random() * Math.PI * 2, r = 40 + random() * 40;
      const s = Math.sqrt(1 - u * u);
      positions.set([s * Math.cos(theta) * r, u * r, s * Math.sin(theta) * r], i * 3);
      sizes[i] = 0.8 + Math.pow(random(), 4) * 2.6;
      phases[i] = random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return new THREE.Points(geometry, new THREE.ShaderMaterial({ vertexShader: starVertex, fragmentShader: starFragment, uniforms: this.starUniforms, transparent: true, depthWrite: false }));
  }

  /** A faint hex grid over the whole sphere; land tiles cover it, so it shows on the sea and in the gaps. */
  private makeOceanGrid() {
    const grid = buildGrid(48);
    const points = new Float32Array((grid.edges.length / 4) * 6);
    for (let e = 0, i = 0; e < grid.edges.length; e += 4) {
      for (const t of [grid.edges[e + 2], grid.edges[e + 3]]) {
        points[i++] = grid.corners[t * 3] * 1.0012; points[i++] = grid.corners[t * 3 + 1] * 1.0012; points[i++] = grid.corners[t * 3 + 2] * 1.0012;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    const lines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x7fb4ff, transparent: true, opacity: 0.07, depthWrite: false }));
    lines.visible = this.look.oceanGrid;
    return lines;
  }

  /** New tiles (hex sizes changed): fresh textures and meshes; ownership follows with setTerritory. */
  setTiles(tiles: TileSet) {
    this.tiles = tiles;
    const rows = Math.max(1, Math.ceil(tiles.count / TEX_W));
    this.stateData = new Float32Array(TEX_W * rows * 4);
    this.colorData = new Uint8Array(TEX_W * rows * 4);
    this.toneData = new Uint8Array(TEX_W * rows * 4);
    this.stateTex.dispose();
    this.colorTex.dispose();
    this.toneTex.dispose();
    this.stateTex = new THREE.DataTexture(this.stateData, TEX_W, rows, THREE.RGBAFormat, THREE.FloatType);
    this.colorTex = new THREE.DataTexture(this.colorData, TEX_W, rows, THREE.RGBAFormat, THREE.UnsignedByteType);
    this.toneTex = new THREE.DataTexture(this.toneData, TEX_W, rows, THREE.RGBAFormat, THREE.UnsignedByteType);
    for (const texture of [this.stateTex, this.colorTex, this.toneTex]) {
      texture.minFilter = texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    }
    this.tileUniforms.uState.value = this.stateTex;
    this.tileUniforms.uColor.value = this.colorTex;
    this.tileUniforms.uTone.value = this.toneTex;
    this.tones = [];
    const n = tiles.count;
    this.ownerOf = new Int32Array(n).fill(-1);
    this.ownerKey = new Int32Array(n).fill(-1);
    this.raise = new Float32Array(n);
    this.raiseTarget = new Float32Array(n);
    this.dim = new Float32Array(n);
    this.dimTarget = new Float32Array(n);
    this.flash = new Float32Array(n);
    // Tiles already on screen stay up when only the hex sizes change; the very first time they rise in a wave.
    this.appearAt = new Float32Array(n).fill(this.shown ? -10 : Infinity);
    for (let t = 0; t < n; t++) this.paint(t);
    for (const mesh of this.shapeMeshes) if (mesh) { this.tileGroup.remove(mesh); mesh.geometry.dispose(); }
    this.shapeMeshes = tiles.shapes.map(() => null);
    tiles.shapes.forEach((_, s) => this.rebuildShape(s));
    this.buildCoast(tiles);
    this.blobs = [];
    this.writeBlobs();
    this.settled = false;
  }

  /** A shallow-water glow along every coast (edges with sea beyond them, not another country). */
  private buildCoast(tiles: TileSet) {
    if (this.coast) { this.scene.remove(this.coast); this.coast.geometry.dispose(); }
    const { centers, verts, vStart, edgeNbr } = tiles;
    const points: number[] = [], fade: number[] = [];
    const lift = 1.0006;
    for (let t = 0; t < tiles.count; t++) {
      const cx = centers[t * 3], cy = centers[t * 3 + 1], cz = centers[t * 3 + 2];
      const m = vStart[t + 1] - vStart[t];
      for (let k = 0; k < m; k++) {
        if (edgeNbr[vStart[t] + k] >= 0) continue;
        const a = (vStart[t] + k) * 3, b = (vStart[t] + ((k + 1) % m)) * 3;
        // Is it sea just beyond this edge (rather than a country with other hex sizes)?
        let ox = (verts[a] + verts[b]) / 2, oy = (verts[a + 1] + verts[b + 1]) / 2, oz = (verts[a + 2] + verts[b + 2]) / 2;
        ox += (ox - cx) * 0.8; oy += (oy - cy) * 0.8; oz += (oz - cz) * 0.8;
        const length = Math.hypot(ox, oy, oz);
        const [lat, lng] = vecToLatLng(ox / length, oy / length, oz / length);
        if (tileAt(tiles, lat, lng) >= 0) continue;
        // A band from the edge out to sea: about 60 km, a little more around big hexes.
        const width = 0.0095 + Math.hypot(verts[a] - cx, verts[a + 1] - cy, verts[a + 2] - cz) * 0.4;
        const out = (i: number) => {
          let x = verts[i] - cx, y = verts[i + 1] - cy, z = verts[i + 2] - cz;
          const l = Math.hypot(x, y, z) || 1;
          x = verts[i] + (x / l) * width; y = verts[i + 1] + (y / l) * width; z = verts[i + 2] + (z / l) * width;
          const ll = Math.hypot(x, y, z);
          return [(x / ll) * lift, (y / ll) * lift, (z / ll) * lift];
        };
        const [a2x, a2y, a2z] = out(a), [b2x, b2y, b2z] = out(b);
        const ax = verts[a] * lift, ay = verts[a + 1] * lift, az = verts[a + 2] * lift;
        const bx = verts[b] * lift, by = verts[b + 1] * lift, bz = verts[b + 2] * lift;
        points.push(ax, ay, az, bx, by, bz, b2x, b2y, b2z, ax, ay, az, b2x, b2y, b2z, a2x, a2y, a2z);
        fade.push(1, 1, 0, 1, 0, 0);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute('aFade', new THREE.Float32BufferAttribute(fade, 1));
    const material = new THREE.ShaderMaterial({ vertexShader: coastVertex, fragmentShader: coastFragment, uniforms: { uGlow: this.atmoUniforms.uGlow }, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.coast = new THREE.Mesh(geometry, material);
    this.coast.renderOrder = 1;
    this.scene.add(this.coast);
  }

  /** How much of the owner's own colour shows on their land: all of it when selected, most for you, some on hover. */
  private tint(o: number) {
    return o === this.focusOwner ? 1 : o === this.me ? 0.85 : o === this.hoverOwner ? 0.6 : 0;
  }

  private paint(t: number) {
    const o4 = t * 4;
    const o = this.ownerOf[t];
    let rgb: [number, number, number];
    if (o >= 0 && this.land[o]) {
      const base = this.land[o], own = this.accent[o] ?? base, k = this.tint(o);
      rgb = [base[0] + (own[0] - base[0]) * k, base[1] + (own[1] - base[1]) * k, base[2] + (own[2] - base[2]) * k];
    } else if (this.tiles && this.tiles.shapeOf[t] === this.tiles.ice) rgb = ICE;
    else {
      const k = 0.94 + (((t * 2654435761) >>> 0) / 4294967296) * 0.12;
      rgb = [UNCLAIMED[0] * k, UNCLAIMED[1] * k, UNCLAIMED[2] * k];
    }
    this.colorData[o4] = rgb[0]; this.colorData[o4 + 1] = rgb[1]; this.colorData[o4 + 2] = rgb[2];
    this.colorData[o4 + 3] = o >= 0 && o === this.me ? 255 : 0;
    // The country's colour, and how many tiles this walker has (alpha = 16·√tiles); highlighted land always shows its own colour.
    const tone = (this.tiles && this.tones[this.tiles.shapeOf[t]]) || rgb;
    this.toneData[o4] = tone[0]; this.toneData[o4 + 1] = tone[1]; this.toneData[o4 + 2] = tone[2];
    const tiles = o >= 0 ? this.ownerStart[o + 1] - this.ownerStart[o] : 0;
    this.toneData[o4 + 3] = o < 0 || this.tint(o) > 0 ? 255 : Math.min(255, Math.round(Math.sqrt(tiles) * 16));
  }

  private repaintOwner(o: number) {
    if (o < 0 || o + 1 >= this.ownerStart.length) return;
    for (let k = this.ownerStart[o]; k < this.ownerStart[o + 1]; k++) this.paint(this.ownerTiles[k]);
    this.colorTex.needsUpdate = true;
    this.toneTex.needsUpdate = true;
  }

  /**
   * One country's tiles as a mesh. Tiles of the same owner sit flush; where the owner changes (or the country or the
   * coast ends) the edge is pulled in to leave a gap and gets a little wall, so every territory reads as one piece.
   */
  private rebuildShape(s: number) {
    const tiles = this.tiles!;
    const shape = tiles.shapes[s];
    const old = this.shapeMeshes[s];
    if (old) { this.tileGroup.remove(old); old.geometry.dispose(); this.shapeMeshes[s] = null; }
    if (shape.end <= shape.start) return;
    const { centers, verts, vStart, edgeNbr, shapeOf } = tiles;
    const owner = this.ownerOf;
    // A hex's corner-to-centre size in globe radii; the gap is a fixed share of it, so same-size neighbours agree.
    const hexR = (t: number) => Math.sqrt((tiles.km2[t] * 2) / (3 * Math.sqrt(3))) / EARTH_KM;
    const isEdge = (t: number, k: number) => {
      const nb = edgeNbr[k];
      return nb < 0 || shapeOf[nb] !== s || owner[nb] !== owner[t];
    };
    let vertCount = 0, indexCount = 0;
    for (let t = shape.start; t < shape.end; t++) {
      const m = vStart[t + 1] - vStart[t];
      vertCount += 1 + m;
      indexCount += m * 3;
      let edges = 0;
      for (let k = vStart[t]; k < vStart[t + 1]; k++) if (isEdge(t, k)) { vertCount += 4; indexCount += 6; edges++; }
      // A full-size plate under any tile that has a gap, so the gap shows grout, not the sea.
      if (edges) { vertCount += 1 + m; indexCount += m * 3; }
    }
    const position = new Float32Array(vertCount * 3);
    const normal = new Float32Array(vertCount * 3);
    const aTile = new Float32Array(vertCount);
    const aTop = new Float32Array(vertCount);
    const aRim = new Float32Array(vertCount);
    const aShade = new Float32Array(vertCount);
    const aHexR = new Float32Array(vertCount);
    const index = new Uint32Array(indexCount);
    let v = 0, i = 0;
    let tileR = 0;
    const put = (x: number, y: number, z: number, nx: number, ny: number, nz: number, t: number, top: number, rim: number, shade = 1) => {
      position[v * 3] = x; position[v * 3 + 1] = y; position[v * 3 + 2] = z;
      normal[v * 3] = nx; normal[v * 3 + 1] = ny; normal[v * 3 + 2] = nz;
      aTile[v] = t; aTop[v] = top; aRim[v] = rim; aShade[v] = shade; aHexR[v] = tileR;
      return v++;
    };
    const px: number[] = [], py: number[] = [], off: number[] = [], qx: number[] = [], qy: number[] = [];
    const ring: number[] = [];
    for (let t = shape.start; t < shape.end; t++) {
      const cx = centers[t * 3], cy = centers[t * 3 + 1], cz = centers[t * 3 + 2];
      let ux = -cz, uz = cx;
      if (Math.hypot(ux, uz) < 1e-6) { ux = 1; uz = 0; }
      const ul = Math.hypot(ux, uz);
      ux /= ul; uz /= ul;
      const wx = cy * uz, wy = cz * ux - cx * uz, wz = -cy * ux;
      const start = vStart[t], m = vStart[t + 1] - start;
      tileR = hexR(t);
      const gap = this.look.tileGap * 0.5 * tileR;
      // Grout sits just above the sea (tiles run from 0.994 to 1 + tile height); smaller hexes a hair higher, so
      // plates of neighbouring sizes never fight.
      const groutLevel = 0.6 + tiles.res[t] * 0.01;
      px.length = py.length = off.length = qx.length = qy.length = ring.length = 0;
      for (let k = 0; k < m; k++) {
        const dx = verts[(start + k) * 3] - cx, dy = verts[(start + k) * 3 + 1] - cy, dz = verts[(start + k) * 3 + 2] - cz;
        px.push(dx * ux + dz * uz);
        py.push(dx * wx + dy * wy + dz * wz);
        off.push(isEdge(t, start + k) ? gap : 0);
      }
      // Each edge moves inward by its offset; a corner is where its two (moved) edges meet.
      for (let k = 0; k < m; k++) {
        const a = (k - 1 + m) % m, b = (k + 1) % m;
        let d1x = px[k] - px[a], d1y = py[k] - py[a], d2x = px[b] - px[k], d2y = py[b] - py[k];
        const l1 = Math.hypot(d1x, d1y) || 1, l2 = Math.hypot(d2x, d2y) || 1;
        d1x /= l1; d1y /= l1; d2x /= l2; d2y /= l2;
        let n1x = -d1y, n1y = d1x, n2x = -d2y, n2y = d2x;
        if (n1x * -px[a] + n1y * -py[a] < 0) { n1x = -n1x; n1y = -n1y; }
        if (n2x * -px[k] + n2y * -py[k] < 0) { n2x = -n2x; n2y = -n2y; }
        const cross = d1x * d2y - d1y * d2x;
        if (Math.abs(cross) < 1e-4) {
          qx.push(px[k] + (n1x * off[a] + n2x * off[k]) * 0.5);
          qy.push(py[k] + (n1y * off[a] + n2y * off[k]) * 0.5);
        } else {
          const p1x = px[a] + n1x * off[a], p1y = py[a] + n1y * off[a];
          const p2x = px[k] + n2x * off[k], p2y = py[k] + n2y * off[k];
          const tt = ((p2x - p1x) * d2y - (p2y - p1y) * d2x) / cross;
          qx.push(p1x + d1x * tt);
          qy.push(p1y + d1y * tt);
        }
      }
      const center = put(cx, cy, cz, cx, cy, cz, t, 1, 0);
      for (let k = 0; k < m; k++) {
        let x = cx + ux * qx[k] + wx * qy[k], y = cy + wy * qy[k], z = cz + uz * qx[k] + wz * qy[k];
        const length = Math.hypot(x, y, z);
        x /= length; y /= length; z /= length;
        ring.push(x, y, z);
        put(x, y, z, cx, cy, cz, t, 1, 1);
      }
      for (let k = 0; k < m; k++) { index[i++] = center; index[i++] = center + 1 + k; index[i++] = center + 1 + ((k + 1) % m); }
      if (off.some(value => value > 0)) {
        const plate = put(cx, cy, cz, cx, cy, cz, t, groutLevel, 0, 0.76);
        for (let k = 0; k < m; k++) put(verts[(start + k) * 3], verts[(start + k) * 3 + 1], verts[(start + k) * 3 + 2], cx, cy, cz, t, groutLevel, 0, 0.76);
        for (let k = 0; k < m; k++) { index[i++] = plate; index[i++] = plate + 1 + k; index[i++] = plate + 1 + ((k + 1) % m); }
      }
      // Walls under the edges that face another owner, another country or the sea.
      for (let k = 0; k < m; k++) {
        if (!off[k]) continue;
        const k2 = (k + 1) % m;
        const ax = ring[k * 3], ay = ring[k * 3 + 1], az = ring[k * 3 + 2];
        const bx = ring[k2 * 3], by = ring[k2 * 3 + 1], bz = ring[k2 * 3 + 2];
        let nx = (ax + bx) / 2 - cx, ny = (ay + by) / 2 - cy, nz = (az + bz) / 2 - cz;
        const along = nx * cx + ny * cy + nz * cz;
        nx -= along * cx; ny -= along * cy; nz -= along * cz;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl; ny /= nl; nz /= nl;
        const p0 = put(ax, ay, az, nx, ny, nz, t, 1, 1, 0.86);
        const p1 = put(bx, by, bz, nx, ny, nz, t, 1, 1, 0.86);
        const p2 = put(bx, by, bz, nx, ny, nz, t, 0, 1, 0.7);
        const p3 = put(ax, ay, az, nx, ny, nz, t, 0, 1, 0.7);
        index[i++] = p0; index[i++] = p3; index[i++] = p1;
        index[i++] = p1; index[i++] = p3; index[i++] = p2;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
    geometry.setAttribute('aTile', new THREE.BufferAttribute(aTile, 1));
    geometry.setAttribute('aTop', new THREE.BufferAttribute(aTop, 1));
    geometry.setAttribute('aRim', new THREE.BufferAttribute(aRim, 1));
    geometry.setAttribute('aShade', new THREE.BufferAttribute(aShade, 1));
    geometry.setAttribute('aHexR', new THREE.BufferAttribute(aHexR, 1));
    geometry.setIndex(new THREE.BufferAttribute(index, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1.1);
    const mesh = new THREE.Mesh(geometry, this.tileMaterial);
    this.shapeMeshes[s] = mesh;
    this.tileGroup.add(mesh);
  }

  /**
   * New owners for the tiles: land colours, rebuilt meshes for the countries that changed, and the blobs.
   * `ownerKeys` is a stable number per owner (so a tile that changes hands flashes); `land` is each owner's land colour
   * and `accent` their own colour.
   */
  setTerritory(owner: Int32Array, ownerKeys: Int32Array, land: [number, number, number][], accent: [number, number, number][], tones: ([number, number, number] | null)[], me: number, blobs: BlobSpec[]) {
    const tiles = this.tiles;
    if (!tiles || owner.length !== tiles.count) return;
    this.land = land;
    this.tones = tones;
    this.accent = accent;
    this.me = me;
    // Tiles per owner, for repainting one territory on hover or selection.
    const start = new Int32Array(land.length + 1);
    for (let t = 0; t < tiles.count; t++) if (owner[t] >= 0) start[owner[t] + 1]++;
    for (let o = 0; o < land.length; o++) start[o + 1] += start[o];
    const list = new Int32Array(start[land.length]);
    const at = start.slice(0, land.length);
    for (let t = 0; t < tiles.count; t++) if (owner[t] >= 0) list[at[owner[t]]++] = t;
    this.ownerStart = start;
    this.ownerTiles = list;
    const now = this.elapsed;
    const view = this.camera.position.clone().normalize();
    const changed = new Set<number>();
    const first = !this.shown;
    for (let t = 0; t < tiles.count; t++) {
      const o = owner[t];
      const key = o >= 0 ? ownerKeys[o] : -1;
      if (key !== this.ownerKey[t]) {
        changed.add(tiles.shapeOf[t]);
        if (!first && !this.reduced && this.appearAt[t] === -10) this.flash[t] = 1;
        this.ownerKey[t] = key;
      }
      this.ownerOf[t] = o;
      this.paint(t);
      if (first) {
        const d = 1 - (tiles.centers[t * 3] * view.x + tiles.centers[t * 3 + 1] * view.y + tiles.centers[t * 3 + 2] * view.z);
        this.appearAt[t] = this.reduced ? -10 : now + 0.1 + d * 0.6 + Math.random() * 0.2;
      }
    }
    this.shown = true;
    for (const s of changed) this.rebuildShape(s);
    this.colorTex.needsUpdate = true;
    this.toneTex.needsUpdate = true;
    this.blobs = blobs;
    this.writeBlobs();
    this.applyFocusTargets();
  }

  private writeBlobs() {
    const fill = (mesh: Cards, layout: Record<string, number>, count: number) => {
      const geometry = mesh.geometry;
      const attrs: Record<string, THREE.InstancedBufferAttribute> = {};
      for (const [name, size] of Object.entries(layout)) {
        let attr = geometry.getAttribute(name) as THREE.InstancedBufferAttribute | undefined;
        if (!attr || attr.count < count) {
          attr = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(16, Math.ceil(count * 1.25)) * size), size);
          geometry.setAttribute(name, attr);
        }
        attr.needsUpdate = true;
        attrs[name] = attr;
      }
      geometry.instanceCount = count;
      return attrs;
    };
    const tiles = this.tiles;
    const list = tiles ? this.blobs : [];
    const crowned = list.filter(spec => spec.crown >= 0);
    const b = fill(this.blobMesh, { iTile: 1, iDir: 3, iSize: 2, iColor: 3, iShape: 4, iFace: 4 }, list.length);
    const c = fill(this.crownMesh, { iTile: 1, iDir: 3, iSize: 2, iSlot: 1, iSquash: 1 }, crowned.length);
    if (!tiles) return;
    list.forEach((spec, n) => {
      const t = spec.tile;
      b.iTile.setX(n, t);
      b.iDir.setXYZ(n, tiles.centers[t * 3], tiles.centers[t * 3 + 1], tiles.centers[t * 3 + 2]);
      b.iSize.setXY(n, spec.size, spec.minPx);
      b.iColor.setXYZ(n, spec.rgb[0] / 255, spec.rgb[1] / 255, spec.rgb[2] / 255);
      b.iShape.setXYZW(n, ...spec.shape);
      b.iFace.setXYZW(n, ...spec.face);
    });
    crowned.forEach((spec, n) => {
      const t = spec.tile;
      c.iTile.setX(n, t);
      c.iDir.setXYZ(n, tiles.centers[t * 3], tiles.centers[t * 3 + 1], tiles.centers[t * 3 + 2]);
      c.iSize.setXY(n, spec.size, spec.minPx);
      c.iSlot.setX(n, spec.crown);
      c.iSquash.setX(n, spec.face[3]);
    });
    this.lastView.elements[0] = NaN;
  }

  /** Dims everything outside the focused country, and lifts the focused owner's tiles. */
  setFocus(shape: number, owner: number) {
    const before = this.focusOwner;
    this.focusShape = shape;
    this.focusOwner = owner;
    this.repaintOwner(before);
    this.repaintOwner(owner);
    this.applyFocusTargets();
  }

  private setHoverOwner(owner: number) {
    if (owner === this.hoverOwner) return;
    const before = this.hoverOwner;
    this.hoverOwner = owner;
    this.repaintOwner(before);
    this.repaintOwner(owner);
    this.applyFocusTargets();
  }

  private applyFocusTargets() {
    const tiles = this.tiles;
    if (!tiles) return;
    for (let t = 0; t < tiles.count; t++) {
      const o = this.ownerOf[t];
      this.raiseTarget[t] = o >= 0 && o === this.focusOwner ? 1 : o >= 0 && o === this.hoverOwner ? 0.5 : 0;
      this.dimTarget[t] = this.focusShape >= 0 && tiles.shapeOf[t] !== this.focusShape ? 1 : this.focusOwner >= 0 && o !== this.focusOwner ? 0.3 : 0;
    }
    this.settled = false;
  }

  /** How many name tags may show at once. */
  setTagLimit(limit: number) {
    this.tagLimit = limit;
    this.lastView.elements[0] = NaN;
  }

  setLook(next: Partial<Look>) {
    const before = this.look;
    this.look = { ...this.look, ...next };
    this.tileUniforms.uTileH.value = this.look.tileHeight;
    this.oceanUniforms.uGlow.value = this.look.atmosphere;
    this.atmoUniforms.uGlow.value = this.look.atmosphere;
    this.cardUniforms.uScale.value = this.look.blobScale;
    this.cardUniforms.uWobble.value = this.look.wobble && !this.reduced ? 1 : 0;
    this.oceanLines.visible = this.look.oceanGrid;
    if (before.tileGap !== this.look.tileGap && this.tiles) this.tiles.shapes.forEach((_, s) => this.rebuildShape(s));
    this.lastView.elements[0] = NaN;
  }

  /** Room the page's panels and title cover, so the globe centres in what's left. */
  setInsets(top: number, right: number, bottom: number) {
    this.insets = { top, right, bottom };
    this.resize();
  }

  /** Camera distance that frames a cap of `radius` radians around the view centre (π/2 or more: the whole globe). */
  fitDistance(radius: number) {
    const width = this.host.clientWidth || 1, height = this.host.clientHeight || 1;
    const tanV = Math.tan((this.camera.fov * Math.PI) / 360);
    const freeW = Math.max(120, width - this.insets.right), freeH = Math.max(120, height - this.insets.top - this.insets.bottom);
    const half = Math.min(Math.atan(tanV * (freeH / height)), Math.atan(tanV * (width / height) * (freeW / width))) * 0.9;
    if (radius >= 1.5) return Math.min(14, 1 / Math.sin(half * 0.94));
    return Math.min(14, Math.max(1.04, Math.cos(radius) + Math.sin(radius) / Math.tan(half)));
  }

  /** Turns the camera to look at a direction on the globe, framing `radius` radians around it. */
  flyTo(dir: [number, number, number], radius: number, duration = 1.4) {
    const to = new THREE.Vector3(...dir).normalize();
    const fromDist = this.camera.position.length();
    const toDist = this.fitDistance(radius);
    if (this.reduced || duration <= 0) {
      this.flight = null;
      this.camera.position.copy(to.multiplyScalar(toDist));
      this.controls.update();
      return;
    }
    this.flight = { from: this.camera.position.clone().normalize(), to, fromDist, toDist, start: this.elapsed, duration };
    this.lastInteraction = performance.now();
  }

  distance() { return this.camera.position.length(); }

  private resize = () => {
    const width = this.host.clientWidth, height = this.host.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.setViewOffset(width, height, this.insets.right / 2, (this.insets.bottom - this.insets.top) / 2, width, height);
    this.camera.updateProjectionMatrix();
    this.cardUniforms.uFocal.value = height / (2 * Math.tan((this.camera.fov * Math.PI) / 360));
    this.lastView.elements[0] = NaN;
  };

  private pick(x: number, y: number): GlobeHit | null {
    const tiles = this.tiles;
    if (!tiles) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const point = this.raycaster.ray.intersectSphere(this.sphere, new THREE.Vector3());
    if (!point) return null;
    point.normalize();
    const [lat, lng] = vecToLatLng(point.x, point.y, point.z);
    const tile = tileAt(tiles, lat, lng);
    if (tile < 0) return null;
    return { tile, shape: tiles.shapeOf[tile], owner: this.ownerOf[tile] };
  }

  private onPointerMove = (event: PointerEvent) => {
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
    this.pointer.inside = true;
    if (this.pointer.down && Math.hypot(event.clientX - this.pointer.downX, event.clientY - this.pointer.downY) > 5) this.pointer.moved = true;
  };

  private onPointerDown = (event: PointerEvent) => {
    this.pointer.down = true;
    this.pointer.moved = false;
    this.pointer.downX = event.clientX;
    this.pointer.downY = event.clientY;
    this.lastInteraction = performance.now();
  };

  private onPointerUp = (event: PointerEvent) => {
    const click = this.pointer.down && !this.pointer.moved;
    this.pointer.down = false;
    if (click) this.callbacks.onPick(this.pick(event.clientX, event.clientY));
  };

  private onPointerLeave = () => {
    this.pointer.inside = false;
    this.pointer.down = false;
    this.setHoverOwner(-1);
    this.callbacks.onHover(null, 0, 0);
    this.renderer.domElement.style.cursor = '';
  };

  private tick = () => {
    if (this.disposed) return;
    this.frame = requestAnimationFrame(this.tick);
    this.timer.update();
    const dt = Math.min(0.05, this.timer.getDelta());
    const time = (this.elapsed = this.timer.getElapsed());
    for (const uniforms of [this.tileUniforms, this.oceanUniforms, this.starUniforms, this.cardUniforms]) uniforms.uTime.value = time;
    // The atmosphere breathes in over the first second and a half.
    const glow = this.look.atmosphere * (this.reduced ? 1 : Math.min(1, time / 1.6));
    this.oceanUniforms.uGlow.value = glow;
    this.atmoUniforms.uGlow.value = glow;

    if (this.flight) {
      const f = this.flight;
      const t = Math.min(1, (time - f.start) / f.duration);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const dir = f.from.clone().lerp(f.to, e);
      if (dir.lengthSq() < 1e-6) dir.copy(f.to);
      dir.normalize();
      // Zooming in: get close mostly near the end, so the trip stays readable.
      const dist = f.fromDist + (f.toDist - f.fromDist) * (f.toDist < f.fromDist ? e * e : e);
      this.camera.position.copy(dir.multiplyScalar(dist));
      this.camera.lookAt(0, 0, 0);
      if (t >= 1) this.flight = null;
      this.controls.update();
    } else {
      const idle = performance.now() - this.lastInteraction > 7000;
      this.controls.autoRotate = !this.reduced && idle && this.look.autoRotate > 0 && this.focusOwner < 0 && this.focusShape < 0;
      this.controls.autoRotateSpeed = this.look.autoRotate;
      const dist = this.camera.position.length();
      this.controls.rotateSpeed = 0.04 + 0.55 * Math.min(1, (dist - 1) / 3.5);
      this.controls.zoomSpeed = 0.5 + 0.5 * Math.min(1, (dist - 1) / 2);
      this.controls.update(dt);
    }

    this.animateTiles(dt, time);
    this.camera.updateMatrixWorld();
    if (!this.lastView.equals(this.camera.matrixWorld) || this.tagAge++ > 20) {
      this.lastView.copy(this.camera.matrixWorld);
      this.tagAge = 0;
      this.placeTags();
    }

    if (this.pointer.inside && !this.pointer.down) {
      const hit = this.pick(this.pointer.x, this.pointer.y);
      this.setHoverOwner(hit ? hit.owner : -1);
      this.renderer.domElement.style.cursor = hit ? 'pointer' : '';
      this.callbacks.onHover(hit, this.pointer.x, this.pointer.y);
    }
    this.renderer.render(this.scene, this.camera);
  };

  private animateTiles(dt: number, time: number) {
    if (this.settled || !this.tiles) return;
    const k = 1 - Math.exp(-dt * 9);
    const decay = Math.exp(-dt * 2.2);
    let busy = false;
    const data = this.stateData;
    for (let t = 0; t < this.tiles.count; t++) {
      const o = t * 4;
      let r = this.raise[t];
      const rt = this.raiseTarget[t];
      if (Math.abs(rt - r) > 0.002) { r += (rt - r) * k; busy = true; } else r = rt;
      this.raise[t] = r;
      let d = this.dim[t];
      const dtg = this.dimTarget[t];
      if (Math.abs(dtg - d) > 0.002) { d += (dtg - d) * k; busy = true; } else d = dtg;
      this.dim[t] = d;
      let f = this.flash[t];
      if (f > 0.01) { f *= decay; busy = true; } else f = 0;
      this.flash[t] = f;
      const start = this.appearAt[t];
      let appear = 1;
      if (start === Infinity) appear = 0;
      else if (start >= 0) {
        appear = Math.min(1, Math.max(0, (time - start) / 0.55));
        if (appear < 1) busy = true;
        else this.appearAt[t] = -10;
      }
      data[o] = r; data[o + 1] = f; data[o + 2] = d; data[o + 3] = appear;
    }
    this.stateTex.needsUpdate = true;
    if (!busy) this.settled = true;
  }

  /**
   * Name tags: every blob that is big enough on screen (or pinned) gets one, most important first, skipping tags that
   * would overlap one already placed or the page's own text (elements marked data-rc-block).
   */
  private placeTags() {
    const tiles = this.tiles;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const blocked = [...document.querySelectorAll('[data-rc-block]')].map(el => {
      const box = el.getBoundingClientRect();
      return [box.left - rect.left, box.top - rect.top, box.right - rect.left, box.bottom - rect.top] as [number, number, number, number];
    });
    const placed: [number, number, number, number][] = [];
    const used = new Set<string>();
    if (tiles) {
      const camera = this.camera;
      const cam = camera.position;
      const focal = this.cardUniforms.uFocal.value as number;
      const scale = this.look.blobScale;
      const view = camera.matrixWorldInverse;
      const v = new THREE.Vector3();
      for (const spec of this.blobs) {
        if (placed.length >= this.tagLimit) break;
        if (!spec.label) continue;
        const t = spec.tile;
        const x = tiles.centers[t * 3], y = tiles.centers[t * 3 + 1], z = tiles.centers[t * 3 + 2];
        // Facing the camera, and not about to slip over the edge?
        const facing = (x * cam.x + y * cam.y + z * cam.z - 1) / Math.max(1e-6, Math.hypot(cam.x - x, cam.y - y, cam.z - z));
        if (facing < 0.3) continue;
        v.set(x, y, z).applyMatrix4(view);
        const depth = -v.z;
        if (depth <= 0.001) continue;
        const px = Math.min(Math.max((spec.size * scale * focal) / depth, spec.minPx), Math.max(spec.minPx, 120));
        if (px < this.look.tagPx && !spec.pinned) continue;
        v.set(x, y, z).project(camera);
        const sx = (v.x * 0.5 + 0.5) * rect.width, sy = (-v.y * 0.5 + 0.5) * rect.height;
        if (sx < -40 || sy < -40 || sx > rect.width + 40 || sy > rect.height + 40) continue;
        const tag = this.tagFor(spec, px > 64);
        const [w, h] = tag.size;
        const top = sy - px * (spec.crown >= 0 ? 1.08 : 0.9) - h - 4;
        const box: [number, number, number, number] = [sx - w / 2, top, sx + w / 2, top + h];
        const outside = box[0] < 4 || box[1] < 4 + this.insets.top * 0.5 || box[2] > rect.width - 4 - this.insets.right || box[3] > rect.height - 4 - this.insets.bottom;
        if (outside) continue;
        const hits = (other: [number, number, number, number]) => box[0] < other[2] && box[2] > other[0] && box[1] < other[3] && box[3] > other[1];
        if (placed.some(hits) || (!spec.pinned && blocked.some(hits))) continue;
        placed.push(box);
        used.add(spec.key);
        tag.el.style.transform = `translate3d(${Math.round(box[0])}px, ${Math.round(box[1])}px, 0)`;
        tag.el.style.opacity = '1';
      }
    }
    for (const tag of this.tags) if (!used.has(tag.key)) { tag.el.style.opacity = '0'; tag.key = ''; }
  }

  /** A pooled tag element showing this blob's text (with the extra line when zoomed right in). */
  private tagFor(spec: BlobSpec, near: boolean): TagState {
    let tag = this.tags.find(item => item.key === spec.key) ?? this.tags.find(item => !item.key);
    if (!tag) {
      const el = document.createElement('div');
      el.className = 'rc-tag';
      el.innerHTML = '<b></b><small></small><small class="rc-tag-extra"></small>';
      this.overlay.appendChild(el);
      tag = { el, key: '', size: [0, 0] };
      this.tags.push(tag);
    }
    tag.key = spec.key;
    const label = spec.label!;
    const extraText = near ? label.extra : '';
    const [title, sub, extra] = tag.el.children as unknown as HTMLElement[];
    if (title.textContent !== label.title || sub.textContent !== label.sub || extra.textContent !== extraText || tag.el.dataset.tone !== label.tone) {
      title.textContent = label.title;
      sub.textContent = label.sub;
      extra.textContent = extraText;
      extra.hidden = !extraText;
      tag.el.dataset.tone = label.tone;
      tag.size = [0, 0];
    }
    if (!tag.size[0]) tag.size = [tag.el.offsetWidth, tag.el.offsetHeight];
    return tag;
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.controls.dispose();
    for (const tag of this.tags) tag.el.remove();
    this.scene.traverse(object => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach(item => item.dispose());
      else material?.dispose();
    });
    this.tileMaterial.dispose();
    this.stateTex.dispose();
    this.colorTex.dispose();
    this.toneTex.dispose();
    (this.cardUniforms.uAtlas.value as THREE.Texture).dispose();
    this.renderer.dispose();
    canvas.remove();
  }
}
