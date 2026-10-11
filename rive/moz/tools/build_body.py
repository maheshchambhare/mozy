#!/usr/bin/env python3
"""Build Moz's body and splice it into scene.rml.

The head block in scene.rml is approved art and is never touched: this script only replaces the
text between the BODY:BEGIN/END and ANIM:BEGIN/END markers. Everything is authored in artboard
space from the head's measurements and mapped into each part's local frame (nodes, bones) on the
way out, so the rest pose renders exactly as designed and the bones' bind matrices match it.

Run from rive/moz:  python3 tools/build_body.py
"""
from __future__ import annotations

import math
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
SCENE = HERE.parent / 'scene.rml'
PI = math.pi

# ─── Landmarks (artboard units; the head is the ruler) ───────────────────────
CX, CY = 320.0, 380.0      # head centre
HW, HH = 394.0, 344.0      # head width / height (without the sprout)
YB = 554.0                 # bottom of the head
ROOT = (320.0, 829.0)      # Root origin: the ground line, between the feet
LIGHT = (-0.62, -0.78)     # unit-ish vector toward the key light (upper-left)

# ─── Skin ramp (sampled from the head) ───────────────────────────────────────
HIGHLIGHT, LIGHT_C, BASE, MID, SHADE, DEEP = 'FEF9EF', 'FDF4E4', 'F8EBD4', 'EFDBBB', 'E0C098', 'C9A47C'
AO, GROUND, BOUNCE = '8A6646', '6B4E36', 'E9CDAA'


def argb(rgb, a=1.0):
    return f'{max(0, min(255, round(a * 255))):02X}{rgb}'


# ─── Small vector toolkit ────────────────────────────────────────────────────
def add(a, b): return (a[0] + b[0], a[1] + b[1])
def sub(a, b): return (a[0] - b[0], a[1] - b[1])
def mul(a, k): return (a[0] * k, a[1] * k)
def length(a): return math.hypot(a[0], a[1])
def norm(a):
    l = length(a)
    return (a[0] / l, a[1] / l) if l else (0.0, 0.0)
def rot(a, th):
    c, s = math.cos(th), math.sin(th)
    return (a[0] * c - a[1] * s, a[0] * s + a[1] * c)
def perp(a): return (-a[1], a[0])
def angle(a): return math.atan2(a[1], a[0])
def wrap(a): return (a + PI) % (2 * PI) - PI


class Frame:
    """A rigid local frame: origin and rotation in artboard space."""
    def __init__(self, origin, theta=0.0):
        self.o, self.th = origin, theta
    def to_local(self, p): return rot(sub(p, self.o), -self.th)


IDENT = Frame((0.0, 0.0), 0.0)
ROOTF = Frame(ROOT, 0.0)

_next = [200]   # 0:200 is Root (written by hand in scene.rml)
def nid():
    _next[0] += 1
    return f'0:{_next[0]}'


# ─── Paths ───────────────────────────────────────────────────────────────────
def beziers(pts, alpha=0.34):
    """Smooth closed outline through pts: chordal Catmull-Rom handles, so every vertex is G1."""
    n = len(pts)
    out = []
    for i, p in enumerate(pts):
        a, b = pts[i - 1], pts[(i + 1) % n]
        t = norm(sub(b, a))
        out.append((p, sub(p, mul(t, length(sub(p, a)) * alpha)), add(p, mul(t, length(sub(b, p)) * alpha))))
    return out


def pack(w):
    """Rive weight packing: one byte per slot, low byte first; indices are tendonIndex + 1; values sum to 255."""
    w = [(i, f) for i, f in w if f > 0.002]
    if len(w) == 1:
        return 255, w[0][0] + 1
    (i0, f0), (i1, f1) = w[:2]
    v0 = round(255 * f0 / (f0 + f1))
    v1 = 255 - v0
    if v1 == 0: return 255, i0 + 1
    if v0 == 0: return 255, i1 + 1
    return v0 | (v1 << 8), (i0 + 1) | ((i1 + 1) << 8)


def mat(frame):
    c, s = math.cos(frame.th), math.sin(frame.th)
    return c, s, -s, c, frame.o[0], frame.o[1]


def skin_xml(bind, bones, ind):
    xx, xy, yx, yy, tx, ty = mat(bind)
    rows = [f'{ind}<Skin xx="{xx:.5f}" xy="{xy:.5f}" yx="{yx:.5f}" yy="{yy:.5f}" tx="{tx:.2f}" ty="{ty:.2f}" name="Skin">']
    for b in bones:
        xx, xy, yx, yy, tx, ty = mat(b.frame)
        rows.append(f'{ind}    <Tendon boneId="{b.id}" xx="{xx:.5f}" xy="{xy:.5f}" yx="{yx:.5f}" yy="{yy:.5f}" tx="{tx:.2f}" ty="{ty:.2f}" name="{b.name}"/>')
    rows.append(f'{ind}</Skin>')
    return '\n'.join(rows)


def points_path(name, pts, frame, weights=None, skin=None, ind=''):
    rows = []
    for k, (p, ci, co) in enumerate(beziers(pts)):
        a, i, o = frame.to_local(p), frame.to_local(ci), frame.to_local(co)
        di, do = sub(i, a), sub(o, a)
        attrs = (f'x="{a[0]:.2f}" y="{a[1]:.2f}" inRotation="{angle(di):.4f}" inDistance="{length(di):.2f}" '
                 f'outRotation="{angle(do):.4f}" outDistance="{length(do):.2f}"')
        if weights is None:
            rows.append(f'{ind}    <CubicDetachedVertex {attrs}/>')
        else:
            v, ix = pack(weights[k])
            rows.append(f'{ind}    <CubicDetachedVertex {attrs}><CubicWeight values="{v}" indices="{ix}" '
                        f'inValues="{v}" inIndices="{ix}" outValues="{v}" outIndices="{ix}"/></CubicDetachedVertex>')
    if skin:
        rows.append(skin_xml(skin[0], skin[1], ind + '    '))
    return f'{ind}<PointsPath isClosed="true" name="{name}">\n' + '\n'.join(rows) + f'\n{ind}</PointsPath>'


# ─── Paint ───────────────────────────────────────────────────────────────────
def radial(name, c, r, stops):
    g = ''.join(f'<GradientStop colorValue="{col}" position="{p}"/>' for p, col in stops)
    return (f'<Fill name="{name}"><RadialGradient startX="{c[0]:.1f}" startY="{c[1]:.1f}" endX="{c[0] + r:.1f}" '
            f'endY="{c[1]:.1f}" name="Gradient">{g}</RadialGradient></Fill>')


def linear(name, a, b, stops):
    g = ''.join(f'<GradientStop colorValue="{col}" position="{p}"/>' for p, col in stops)
    return (f'<Fill name="{name}"><LinearGradient startX="{a[0]:.1f}" startY="{a[1]:.1f}" endX="{b[0]:.1f}" '
            f'endY="{b[1]:.1f}" name="Gradient">{g}</LinearGradient></Fill>')


def volume_fills(local_pts, theta, core=0.5, hi=0.6, extra='', tail=''):
    """The shading recipe for one volume, in its local frame: base ramp from an upper-left focal point,
    a feathered core shadow on the lower-right edge and a soft highlight upper-left."""
    xs = [p[0] for p in local_pts]
    ys = [p[1] for p in local_pts]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    hw, hh = (max(xs) - min(xs)) / 2, (max(ys) - min(ys)) / 2
    l = rot(LIGHT, -theta)
    focal = (cx + 0.45 * l[0] * hw, cy + 0.45 * l[1] * hh)
    R = max(length(sub(p, focal)) for p in local_pts)
    base = radial('Base', focal, R, [(0, 'FF' + LIGHT_C), (0.45, 'FF' + BASE), (0.8, 'FF' + MID), (1, 'FF' + SHADE)])
    cc = (cx - 1.25 * l[0] * hw, cy - 1.25 * l[1] * hh)
    corex = radial('CoreShadow', cc, 0.95 * max(hw, hh),
                   [(0, argb(DEEP, core)), (0.5, argb(DEEP, core * 0.45)), (1, argb(DEEP, 0))])
    hc = (cx + 0.62 * l[0] * hw, cy + 0.62 * l[1] * hh)
    hix = radial('Highlight', hc, 0.5 * max(hw, hh), [(0, argb(HIGHLIGHT, hi)), (1, argb(HIGHLIGHT, 0))])
    return base + extra + corex + hix + tail


def soft_blob(name, centre, rx, ry, rot_world, color, alpha, frame, clip=None,
              stops=((0, 1.0), (0.55, 0.65), (1, 0.0)), ind='', id_=None):
    """A feathered elliptical shadow: a circle with a radial gradient fading to clear, scaled into an ellipse."""
    lo = frame.to_local(centre)
    r = max(rx, ry)
    sx, sy = rx / r, ry / r
    g = ''.join(f'<GradientStop colorValue="{argb(color, alpha * f)}" position="{p}"/>' for p, f in stops)
    clipx = f'<ClippingShape sourceId="{clip}" name="Clip"/>' if clip else ''
    idx = f' id="{id_}"' if id_ else ''
    return (f'{ind}<Shape x="{lo[0]:.2f}" y="{lo[1]:.2f}" rotation="{rot_world - frame.th:.4f}" scaleX="{sx:.4f}" '
            f'scaleY="{sy:.4f}" name="{name}"{idx}><Ellipse width="{2 * r:.1f}" height="{2 * r:.1f}" name="Path"/>'
            f'<Fill name="Fill"><RadialGradient startX="0" startY="0" endX="{r:.1f}" endY="0" name="Gradient">{g}'
            f'</RadialGradient></Fill>{clipx}</Shape>')


# ─── Bones ───────────────────────────────────────────────────────────────────
class Bone:
    def __init__(self, name, origin, theta, length_, parent=None):
        self.name, self.o, self.th, self.len, self.parent = name, origin, theta, length_, parent
        self.frame = Frame(origin, theta)
        self.id = nid()
        self.children = []   # child bones (drawn first, so hands sit on top of arms)
        self.extra = []      # pre-rendered xml of shapes parented to this bone
        if parent:
            parent.children.append(self)

    def tip(self):
        return add(self.o, rot((self.len, 0), self.th))

    def xml(self, parent_frame, ind):
        if self.parent is None:
            lo = parent_frame.to_local(self.o)
            head = (f'{ind}<RootBone x="{lo[0]:.2f}" y="{lo[1]:.2f}" rotation="{self.th - parent_frame.th:.5f}" '
                    f'length="{self.len:.2f}" name="{self.name}" id="{self.id}">')
            tag = 'RootBone'
        else:
            assert length(sub(self.o, self.parent.tip())) < 0.01, f'{self.name} is not at its parent tip'
            head = f'{ind}<Bone rotation="{self.th - self.parent.th:.5f}" length="{self.len:.2f}" name="{self.name}" id="{self.id}">'
            tag = 'Bone'
        body = [c.xml(self.frame, ind + '    ') for c in self.children] + list(self.extra)
        return head + '\n' + '\n'.join(body) + f'\n{ind}</{tag}>'


# ─── Torso ───────────────────────────────────────────────────────────────────
TORSO_F = Frame((CX, 750.0), 0.0)   # hip pivot: breathing squashes and stretches from here
BELLY_Y, BELLY_RX, RY_TOP, RY_BOT, BOT_N = 678.0, 114.5, 158.0, 76.0, 2.8


def torso_outline():
    pts = []
    for k in range(12):                      # left → top → right (ellipse, narrow at the top)
        t = PI + k * PI / 12
        pts.append((CX + BELLY_RX * math.cos(t), BELLY_Y + RY_TOP * math.sin(t)))
    for k in range(12):                      # right → bottom → left (superellipse: a broad soft underside)
        t = k * PI / 12
        c, s = math.cos(t), math.sin(t)
        pts.append((CX + BELLY_RX * math.copysign(abs(c) ** (2 / BOT_N), c), BELLY_Y + RY_BOT * abs(s) ** (2 / BOT_N)))
    return pts


def torso_half_width(y):
    """Half-width of the torso at artboard y (for the report)."""
    dy = y - BELLY_Y
    if dy <= 0:
        return BELLY_RX * math.sqrt(max(0.0, 1 - (dy / RY_TOP) ** 2))
    return BELLY_RX * max(0.0, 1 - (dy / RY_BOT) ** BOT_N) ** (1 / BOT_N)


# ─── Arms ────────────────────────────────────────────────────────────────────
ARM_UPPER, ARM_FORE, ARM_R0, ARM_R1 = 64.0, 36.0, 23.5, 19.5
HANG, BEND = 14.0, 8.0          # degrees: hang outward from vertical; forearm bends back inward


def build_arm(side):
    """side -1 = screen-left arm, +1 = screen-right. Returns the bone tree plus data for the cast shadow."""
    tag = 'L' if side < 0 else 'R'
    S = (CX + side * 0.22 * HW, 552.0)                      # shoulder pivot
    th1 = PI / 2 - side * HANG * PI / 180                   # upper arm direction
    th2 = PI / 2 - side * (HANG - BEND) * PI / 180          # forearm direction
    u, v = (math.cos(th1), math.sin(th1)), (math.cos(th2), math.sin(th2))
    E = add(S, mul(u, ARM_UPPER))
    Wr = add(E, mul(v, ARM_FORE))
    L = ARM_UPPER + ARM_FORE

    def P(s): return add(S, mul(u, s)) if s <= ARM_UPPER else add(E, mul(v, s - ARM_UPPER))
    def D(s): return u if s < ARM_UPPER else (norm(add(u, v)) if s == ARM_UPPER else v)
    def r(s): return ARM_R0 - (ARM_R0 - ARM_R1) * s / L
    def n(s): return mul(perp(D(s)), -side)                  # outer normal (away from the body)
    def w(s):
        if s <= 40: return [(0, 1.0)]
        if s >= 88: return [(1, 1.0)]
        f = (s - 40) / 48
        return [(0, 1 - f), (1, f)]

    ss = [0, 16, 32, 48, ARM_UPPER, 80, L]
    pts, wts = [], []
    for s in ss:                                             # outer edge, shoulder → wrist
        pts.append(add(P(s), mul(n(s), r(s)))); wts.append(w(s))
    nv = n(L)
    for phi in (45, 90, 135):                                # wrist cap (hidden under the hand)
        a = phi * PI / 180
        pts.append(add(Wr, mul(add(mul(nv, math.cos(a)), mul(v, math.sin(a))), r(L)))); wts.append([(1, 1.0)])
    for s in reversed(ss):                                   # inner edge, wrist → shoulder
        pts.append(sub(P(s), mul(n(s), r(s)))); wts.append(w(s))
    n0 = n(0)
    for phi in (135, 90, 45):                                # shoulder cap (tucked under the head)
        a = phi * PI / 180
        pts.append(add(S, mul(add(mul(n0, math.cos(a)), mul(mul(u, -1), math.sin(a))), ARM_R0))); wts.append([(0, 1.0)])

    shoulder = Bone(f'Shoulder_{tag}', S, th1, ARM_UPPER)
    elbow = Bone(f'Elbow_{tag}', E, th2, ARM_FORE, shoulder)
    wrist = Bone(f'Wrist_{tag}', Wr, th2, 20.0, elbow)

    arm_id = nid()
    local = [shoulder.frame.to_local(p) for p in pts]
    fills = volume_fills(local, th1, core=0.45, hi=0.55)
    path = points_path(f'Arm_{tag}_Path', pts, shoulder.frame, wts, (shoulder.frame, [shoulder, elbow]), ind='                    ')
    shoulder.extra.append(soft_blob(f'ShoulderAO_{tag}', add(S, mul(u, 6)), 29, 20, th1, AO, 0.52, shoulder.frame,
                                    clip=arm_id, ind='                '))
    shoulder.extra.append(f'                <Shape name="Arm_{tag}" id="{arm_id}">\n{path}\n                    {fills}\n                </Shape>')
    wrist.extra.append(hand_solo(tag, side, th2))

    inner_edge = [(s, sub(P(s), mul(n(s), r(s))), n(s)) for s in (0, 16, 32, 48, ARM_UPPER, 80, L)]
    report = dict(S=S, E=E, Wr=Wr, tip=add(Wr, mul(v, 56.5)), outer_x=pts[0][0], hand_c=add(Wr, mul(v, 23)))
    return shoulder, inner_edge, report


# ─── Hands (authored in the wrist bone's frame: +x toward the fingertips) ────
def egg_pt(t, c, a, b, taper):
    return (c[0] + a * math.cos(t), c[1] + (b + taper * math.cos(t)) * math.sin(t))


def bumped(base_pts, centre, bumps):
    """Push an outline in or out along rays from `centre`: bumps = [(angle, amplitude, width)]."""
    out = []
    for p in base_pts:
        d = sub(p, centre)
        r, ph = length(d), angle(d)
        for a0, amp, wdt in bumps:
            r += amp * math.exp(-(wrap(ph - a0) / wdt) ** 2)
        out.append(add(centre, mul((math.cos(ph), math.sin(ph)), r)))
    return out


def capsule(A, B, R, n=6):
    d = norm(sub(B, A)); nr = perp(d); pts = []
    for k in range(n + 1):
        a = -PI / 2 + PI * k / n
        pts.append(add(B, add(mul(d, R * math.cos(a)), mul(nr, R * math.sin(a)))))
    for k in range(n + 1):
        a = PI / 2 + PI * k / n
        pts.append(add(A, add(mul(d, R * math.cos(a)), mul(nr, R * math.sin(a)))))
    return pts


def crease(name, c, half_len, rot_local, ind):
    return soft_blob(name, c, half_len, 3.2, rot_local, DEEP, 0.5, IDENT, stops=((0, 1.0), (0.6, 0.6), (1, 0.0)), ind=ind)


def hand_solo(tag, side, theta):
    inner = side                      # local y side that faces the body
    I = '                            '
    variants = []

    def variant(name, paths, creases, local_pts, hi=0.40):
        vid = nid()
        body = '\n'.join(creases + [f'{I}<Shape name="{name}_{tag}">'] + paths + [f'{I}    {volume_fills(local_pts, theta, core=0.38, hi=hi)}', f'{I}</Shape>'])
        variants.append((name, vid, f'{I[:-4]}<Node name="{name}" id="{vid}">\n{body}\n{I[:-4]}</Node>'))
        return vid

    # Mitten: a soft egg, a little wider than the wrist, with the thumb nub merged into the silhouette.
    c = (23.0, 0.0)
    base = [egg_pt(2 * PI * k / 40, c, 33.5, 28.5, 2.5) for k in range(40)]
    thumb_a = angle((-0.45, inner * 1.0))
    pts = bumped(base, c, [(thumb_a, 9.0, 0.32)])
    mitten_id = variant('Mitten', [points_path('Mitten_Path', pts, IDENT, ind=I + '    ')], [], pts)

    # Fist: compact and round; the folded thumb is a soft crease, not a line.
    c = (20.0, 0.0)
    pts = [egg_pt(2 * PI * k / 36, c, 29.0, 29.0, 1.5) for k in range(36)]
    cr = [crease(f'Fist_Crease_{tag}', (27.0, inner * 15.0), 10.0, inner * 0.55, I)]
    variant('Fist', [points_path('Fist_Path', pts, IDENT, ind=I + '    ')], cr, pts)

    # Open palm: palm to the viewer, four short fingers suggested by three shallow notches, thumb out to the side.
    c = (25.0, 0.0)
    base = [egg_pt(2 * PI * k / 48, c, 33.0, 29.0, -2.0) for k in range(48)]
    notches = [(angle((33.0, yk)), -4.0, 0.11) for yk in (-14.5, 0.0, 14.5)]
    thumb = [(angle((0.35, inner * 1.0)), 16.0, 0.30)]
    pts = bumped(base, c, notches + thumb)
    cr = [crease(f'Palm_Crease_{tag}{k}', (46.0, yk), 7.0, 0.0, I) for k, yk in enumerate((-14.5, 0.0, 14.5))]
    variant('OpenPalm', [points_path('Palm_Path', pts, IDENT, ind=I + '    ')], cr, pts)

    # Thumbs up: the fist with a rounded capsule thumb pointing on along the forearm.
    c = (20.0, 0.0)
    fist = [egg_pt(2 * PI * k / 36, c, 29.0, 29.0, 1.5) for k in range(36)]
    thumb_pts = capsule((34.0, inner * 7.0), (66.0, inner * 4.0), 11.0)
    cr = [crease(f'ThumbUp_Crease_{tag}', (36.0, inner * 16.0), 8.0, inner * 1.1, I)]
    variant('ThumbUp', [points_path('Fist_Path', fist, IDENT, ind=I + '    '), points_path('Thumb_Path', thumb_pts, IDENT, ind=I + '    ')], cr, fist + thumb_pts)

    solo_id = nid()
    inner_xml = '\n'.join(x for _, _, x in variants)
    return f'{I[:-8]}<Solo activeComponentId="{mitten_id}" name="Hand_{tag}" id="{solo_id}">\n{inner_xml}\n{I[:-8]}</Solo>'


# ─── Legs and feet ───────────────────────────────────────────────────────────
LEG_TOP, LEG_CAP, THIGH_Y, ANKLE_Y, SOLE = 718.0, 27.0, 745.0, 800.0, 829.0
THIGH_HW, ANKLE_HW = 0.13 * HW, 0.11 * HW                    # 51.2 / 43.3
FOOT_CY, FOOT_RY, FOOT_N = 813.0, 16.5, 3.5


def build_leg(side):
    tag = 'L' if side < 0 else 'R'
    xc = CX + side * 0.165 * HW
    foot_cx = xc + side * 3.0

    def body_hw(y):
        if y < THIGH_Y:
            dy = THIGH_Y - y
            return THIGH_HW * math.sqrt(max(0.0, 1 - (dy / LEG_CAP) ** 2)) if dy < LEG_CAP else 0.0
        return THIGH_HW - (THIGH_HW - ANKLE_HW) * (y - THIGH_Y) / (ANKLE_Y - THIGH_Y)

    def foot_hw(y, outer):
        dy = abs(y - FOOT_CY)
        if dy > FOOT_RY: return None
        rx = 56.0 if outer else 50.0
        return rx * (1 - (dy / FOOT_RY) ** FOOT_N) ** (1 / FOOT_N)

    def edge(y, outer):
        """Most outward (outer=True) or inward extent at y, as an offset from xc."""
        best = body_hw(y) if y <= 812 else 0.0
        f = foot_hw(y, outer)
        if f is not None:
            off = (foot_cx - xc) * side
            best = max(best, f + (off if outer else -off))
        return best

    ys = [721, 726, 733, 742, 752, 765, 780, 795, 803, 810, 817, 823, 827.5, 829.4]
    pts = [(xc, LEG_TOP)]
    for y in ys: pts.append((xc + side * edge(y, True), y))
    for y in reversed(ys): pts.append((xc - side * edge(y, False), y))

    def w(y):
        if y < 758: return [(0, 1.0)]
        if y < 786: f = (y - 758) / 28; return [(0, 1 - f), (1, f)]
        if y < 798: return [(1, 1.0)]
        if y < 814: f = (y - 798) / 16; return [(1, 1 - f), (2, f)]
        return [(2, 1.0)]
    wts = [w(p[1]) for p in pts]

    hip = Bone(f'Hip_{tag}', (xc, 724.0), PI / 2, 48.0)
    knee = Bone(f'Knee_{tag}', hip.tip(), PI / 2, 34.0, hip)
    ankle = Bone(f'Ankle_{tag}', knee.tip(), PI / 2, 20.0, knee)
    target_id = nid()
    knee.extra.append(f'                    <IKConstraint targetId="{target_id}" parentBoneCount="1" name="IK_{tag}"/>')

    leg_id = nid()
    local = [hip.frame.to_local(p) for p in pts]
    inner_y = side * THIGH_HW                                # local y of the inner edge (toward the other leg)
    inner = linear('InnerShade', (0, inner_y), (0, inner_y - side * 26), [(0, argb(DEEP, 0.32)), (1, argb(DEEP, 0))])
    fills = volume_fills(local, PI / 2, core=0.5, hi=0.55, extra=inner)
    path = points_path(f'Leg_{tag}_Path', pts, hip.frame, wts, (hip.frame, [hip, knee, ankle]), ind='                    ')
    hip.extra.append(soft_blob(f'Belly_AO_{tag}', (xc, 744.0), 54, 20, 0.0, AO, 0.38, hip.frame, clip=leg_id, ind='                '))
    hip.extra.append(f'                <Shape name="Leg_{tag}" id="{leg_id}">\n{path}\n                    {fills}\n                </Shape>')

    tl = ROOTF.to_local((xc, 724.0))
    tt = ROOTF.to_local(knee.tip())
    node = (f'        <Node x="{tl[0]:.2f}" y="{tl[1]:.2f}" name="Leg_{tag}" id="{nid()}">\n'
            + hip.xml(Frame((xc, 724.0), 0.0), '            ') + '\n        </Node>')
    target = f'        <Node x="{tt[0]:.2f}" y="{tt[1]:.2f}" name="Foot_{tag}_Target" id="{target_id}"/>'
    report = dict(xc=xc, thigh=2 * THIGH_HW, ankle=2 * ANKLE_HW, foot_w=edge(FOOT_CY, True) + edge(FOOT_CY, False),
                  foot_h=2 * FOOT_RY, gap_top=2 * (CX - (xc + side * edge(754, False)) * 1) if side < 0 else None)
    return node, target, report, (foot_cx, hip)


# ─── Assemble ────────────────────────────────────────────────────────────────
def build():
    out = []
    torso_pts = torso_outline()
    torso_id, torso_node_id = nid(), nid()

    arm_l, inner_l, rep_l = build_arm(-1)
    arm_r, inner_r, rep_r = build_arm(+1)

    def cast(tag, inner_edge, wmax, alpha):
        L = inner_edge[-1][0]
        a_side = [add(p, mul(nn, 4)) for s, p, nn in inner_edge]
        b_side = [sub(p, mul(nn, wmax * (1 - s / L) ** 0.8)) for s, p, nn in inner_edge]
        pts = a_side + list(reversed(b_side))
        mid = len(inner_edge) // 2
        a_mid, b_mid = TORSO_F.to_local(a_side[mid]), TORSO_F.to_local(b_side[mid])
        fill = linear('Shadow', a_mid, b_mid, [(0, argb(AO, alpha)), (1, argb(AO, 0))])
        return (f'            <Shape name="ArmCast_{tag}">\n{points_path(f"ArmCast_{tag}_Path", pts, TORSO_F, ind="                ")}\n'
                f'                {fill}<ClippingShape sourceId="{torso_id}" name="Clip"/>\n            </Shape>')

    torso_local = [TORSO_F.to_local(p) for p in torso_pts]
    bottom = max(p[1] for p in torso_local)
    under = linear('UnderBelly', (0, bottom - 48), (0, bottom), [(0, argb(DEEP, 0)), (1, argb(DEEP, 0.38))])
    bounce = linear('Bounce', (0, bottom - 10), (0, bottom), [(0, argb(BOUNCE, 0)), (1, argb(BOUNCE, 0.12))])
    torso_fills = volume_fills(torso_local, 0.0, core=0.5, hi=0.6, extra=under, tail=bounce)
    tl = ROOTF.to_local(TORSO_F.o)
    out.append(f'        <!-- Torso: a soft pear from the chin to the hips, pivot at the hips. Arms hang from it. -->')
    out.append(f'        <Node x="{tl[0]:.2f}" y="{tl[1]:.2f}" name="Torso" id="{torso_node_id}">')
    out.append(arm_l.xml(TORSO_F, '            '))
    out.append(arm_r.xml(TORSO_F, '            '))
    out.append(cast('L', inner_l, 16.0, 0.30))
    out.append(cast('R', inner_r, 6.0, 0.22))
    out.append(soft_blob('HeadContact_AO', (CX, 562.0), 125, 46, 0.0, AO, 0.42, TORSO_F, clip=torso_id, ind='            '))
    out.append(f'            <Shape name="Torso_Fill" id="{torso_id}">\n{points_path("Torso_Path", torso_pts, TORSO_F, ind="                ")}\n                {torso_fills}\n            </Shape>')
    out.append('        </Node>')

    leg_l, tgt_l, lrep, (foot_lx, hip_l) = build_leg(-1)
    leg_r, tgt_r, rrep, (foot_rx, hip_r) = build_leg(+1)
    out.append('        <!-- Legs: chubby beans with rounded feet, each a 3-bone chain with IK to a foot target on the ground. -->')
    out += [leg_l, leg_r, tgt_l, tgt_r]
    out.append('        <!-- Ground: contact shadows under each foot, then the soft ground shadow. -->')
    out.append(soft_blob('FootContact_L', (foot_lx, 827.0), 0.14 * HW, 5.0, 0.0, GROUND, 0.30, ROOTF, ind='        '))
    out.append(soft_blob('FootContact_R', (foot_rx, 827.0), 0.14 * HW, 5.0, 0.0, GROUND, 0.30, ROOTF, ind='        '))
    out.append(soft_blob('GroundShadow', (CX, 831.0), 0.375 * HW, 0.03 * HH, 0.0, GROUND, 0.18, ROOTF, ind='        '))
    body_xml = '\n'.join(out)

    # Idle: a 2.4 s breath. Torso stretches from the hips, head rides it, arms sway 2°, feet stay planted.
    def ease(): return '<CubicEaseInterpolator x1="0.42" y1="0" x2="0.58" y2="1"/>'
    def kp(key, a, b):
        return (f'            <KeyedProperty propertyKey="{key}">'
                f'<KeyFrameDouble value="{a:.5f}" frame="0" interpolationType="cubic">{ease()}</KeyFrameDouble>'
                f'<KeyFrameDouble value="{b:.5f}" frame="72" interpolationType="cubic">{ease()}</KeyFrameDouble>'
                f'<KeyFrameDouble value="{a:.5f}" frame="144"/></KeyedProperty>')
    sway = 2 * PI / 180
    anim = '\n'.join([
        '        <LinearAnimation loopValue="loop" fps="60" duration="144" name="Idle" id="0:6">',
        f'            <KeyedObject objectId="{torso_node_id}">', kp(17, 1.0, 1.025), kp(16, 1.0, 0.99), '            </KeyedObject>',
        '            <KeyedObject objectId="0:20">', kp(14, -449.0, -453.5), '            </KeyedObject>',
        f'            <KeyedObject objectId="{arm_l.id}">', kp(15, arm_l.th, arm_l.th + sway), '            </KeyedObject>',
        f'            <KeyedObject objectId="{arm_r.id}">', kp(15, arm_r.th, arm_r.th - sway), '            </KeyedObject>',
        '        </LinearAnimation>'])

    s = SCENE.read_text()
    b0, b1 = s.index('        <!-- BODY:BEGIN -->') + len('        <!-- BODY:BEGIN -->'), s.index('        <!-- BODY:END -->')
    s = s[:b0] + '\n' + body_xml + '\n' + s[b1:]
    a0, a1 = s.index('        <!-- ANIM:BEGIN -->') + len('        <!-- ANIM:BEGIN -->'), s.index('        <!-- ANIM:END -->')
    s = s[:a0] + '\n' + anim + '\n' + s[a1:]
    SCENE.write_text(s)

    # Landmark report (artboard units; targets from the spec, scaled to this head)
    H, W = HH, HW
    rows = [
        ('visible body, head bottom → soles', 0.80 * H, SOLE - YB),
        ('torso width at the shoulder line', 0.40 * W, 2 * torso_half_width(YB + 0.03 * H)),
        ('belly width at its widest', 0.58 * W, 2 * BELLY_RX),
        ('belly widest y below head bottom', 0.36 * H, BELLY_Y - YB),
        ('crotch arch top below head bottom', 0.58 * H, 754 - YB),
        ('ground line below head bottom', 0.80 * H, SOLE - YB),
        ('leg centre offset from cx', 0.165 * W, abs(lrep['xc'] - CX)),
        ('leg width at the thigh', 0.26 * W, lrep['thigh']),
        ('leg width at the ankle', 0.22 * W, lrep['ankle']),
        ('foot width', 0.27 * W, lrep['foot_w']),
        ('foot height', 0.10 * H, lrep['foot_h']),
        ('shoulder pivot offset from cx', 0.22 * W, abs(rep_l['S'][0] - CX)),
        ('arm thickness, upper', 0.12 * W, 2 * ARM_R0),
        ('arm thickness, wrist', 0.10 * W, 2 * ARM_R1),
        ('arm length, pivot → hand tip', 0.44 * H, length(sub(rep_l['tip'], rep_l['S']))),
        ('hand width × length', 0.155 * W, 2 * 28.5 + 2.5),
        ('total width incl. relaxed arms (max)', 0.72 * W, 2 * (CX - min(rep_l['outer_x'], rep_l['hand_c'][0] - 31))),
    ]
    print(f'{"landmark":42s} {"target":>8s} {"built":>8s}  {"dev":>6s}')
    for name, target, built in rows:
        print(f'{name:42s} {target:8.1f} {built:8.1f}  {100 * (built - target) / target:+5.1f}%')
    print('ids used up to', _next[0])


if __name__ == '__main__':
    build()
