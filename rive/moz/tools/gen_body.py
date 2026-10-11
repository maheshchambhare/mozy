#!/usr/bin/env python3
"""Generate scene.rml for the Moz mascot.

The approved Head block is copied verbatim from the pre-fix backup (only its x/y become
local to a new bottom-centre pivot node). Everything else is generated from
body_params.py: torso, arms, Solo mitten hands, legs, feet, shadows, bones, skins,
IK and the idle loop.

  python3 tools/gen_body.py                      # writes <project>/scene.rml
  python3 tools/gen_body.py --silhouette out.rml # all skin black, no shadows (silhouette test)
"""
import math, os, re, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import body_params as P

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP  = '/Users/mahesh/Desktop/Projects/mcrudra.com/MOZY/rive/backups/moz-before-body-fix/scene.rml'
OUT     = os.path.join(PROJECT, 'scene.rml')
SIL = False   # silhouette mode
POSE = {}     # stress/pose overrides: shoulder_L (abs deg), elbow_L (rel deg), hip_L, knee_L, ik (0/1), hand_L (variant)
NO_IDLE = False
TEST_HITS = False   # test builds only: transparent click targets that fire each pose trigger

# ------------------------------------------------------------------ head ruler
HEAD_CX, HEAD_CY = 320.0, 380.0
HEAD_TOP, HEAD_BOTTOM = HEAD_CY - 170, HEAD_CY + 174        # 210 .. 554
HEAD_LEFT, HEAD_RIGHT = HEAD_CX - 197, HEAD_CX + 197        # 123 .. 517
H = HEAD_BOTTOM - HEAD_TOP      # 344
W = HEAD_RIGHT - HEAD_LEFT      # 394
CX, YB = HEAD_CX, HEAD_BOTTOM
GROUND = round(YB + 0.80 * H)   # 829
HEAD_BALL = [('cm', 0, -170, 0, 104), ('cm', 197, 6, 90, 96), ('cm', 0, 174, 180, 126), ('cm', -197, 6, -90, 96)]

def argb(hex6, a=1.0):
    return f"{int(round(a * 255)):02X}{hex6}"

# ------------------------------------------------------------------ helpers
def rad(deg): return deg * math.pi / 180.0
def fmt(v):
    if isinstance(v, bool): return 'true' if v else 'false'
    if isinstance(v, int): return str(v)
    if isinstance(v, float):
        s = f"{v:.4f}".rstrip('0').rstrip('.')
        return '0' if s in ('-0', '') else s
    return str(v)

class Ids:
    def __init__(self, start): self.n = start
    def new(self): self.n += 1; return f"0:{self.n}"
ids = Ids(200)

class El:
    def __init__(self, tag, **attrs):
        self.tag, self.attrs, self.kids = tag, attrs, []
    def add(self, *kids):
        for k in kids:
            if k is not None: self.kids.append(k)
        return self
    def xml(self, ind=0):
        pad = '    ' * ind
        a = ' '.join(f'{k}="{fmt(v)}"' for k, v in self.attrs.items() if v is not None)
        head = f"{pad}<{self.tag}{(' ' + a) if a else ''}"
        if not self.kids: return head + "/>\n"
        s = head + ">\n"
        for k in self.kids: s += k.xml(ind + 1)
        return s + f"{pad}</{self.tag}>\n"
class Raw:
    def __init__(self, text): self.text = text
    def xml(self, ind=0): return self.text
def comment(text, ind): return Raw('    ' * ind + f"<!-- {text} -->\n")

def vadd(a, b): return (a[0] + b[0], a[1] + b[1])
def vsub(a, b): return (a[0] - b[0], a[1] - b[1])
def vmul(a, k): return (a[0] * k, a[1] * k)
def vnorm(a):
    l = math.hypot(*a); return (a[0] / l, a[1] / l)
def vdist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])

# 2x3 affine in Rive Mat2D order (xx, xy, yx, yy, tx, ty); x unit vector = (xx, xy)
def trs(x, y, rot=0.0, sx=1.0, sy=1.0):
    c, s = math.cos(rot), math.sin(rot)
    return (c * sx, s * sx, -s * sy, c * sy, x, y)
def mul(a, b):
    axx, axy, ayx, ayy, atx, aty = a; bxx, bxy, byx, byy, btx, bty = b
    return (axx * bxx + ayx * bxy, axy * bxx + ayy * bxy, axx * byx + ayx * byy, axy * byx + ayy * byy,
            axx * btx + ayx * bty + atx, axy * btx + ayy * bty + aty)
def apply(m, p): return (m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5])
def mat_attrs(m): return dict(xx=m[0], xy=m[1], yx=m[2], yy=m[3], tx=m[4], ty=m[5])

# vertices --------------------------------------------------------------
class V:
    def __init__(self, kind, x, y, a=0.0, d=0.0, din=0.0, dout=0.0, w=None, radius=0.0):
        self.kind, self.x, self.y, self.a, self.d = kind, x, y, a, d
        self.din, self.dout, self.w, self.radius = din, dout, w, radius
    def copy(self, **kw):
        n = V(self.kind, self.x, self.y, self.a, self.d, self.din, self.dout, self.w, self.radius)
        for k, v in kw.items(): setattr(n, k, v)
        return n
def cm(x, y, a, d, w=None): return V('cm', x, y, a=a, d=d, w=w)
def ca(x, y, a, din, dout, w=None): return V('ca', x, y, a=a, din=din, dout=dout, w=w)
def sv(x, y, w=None, radius=0.0): return V('sv', x, y, w=w, radius=radius)
def T(t):
    """tuple -> V"""
    k = t[0]
    if k == 'cm': return cm(t[1], t[2], t[3], t[4], t[5] if len(t) > 5 else None)
    if k == 'ca': return ca(t[1], t[2], t[3], t[4], t[5], t[6] if len(t) > 6 else None)
    return sv(t[1], t[2], t[3] if len(t) > 3 else None)
def TL(lst): return [T(t) for t in lst]

def mirror_limb(vs): return [v.copy(x=-v.x, a=180 - v.a) for v in vs]
def symmetric_closed(right):
    left = [v.copy(x=-v.x, a=-v.a, din=v.dout, dout=v.din) for v in reversed(right[1:-1])]
    return right + left
def bbox(vs):
    xs = [v.x for v in vs]; ys = [v.y for v in vs]
    return min(xs), min(ys), max(xs), max(ys)

def pack(wd):
    items = [(i, w) for i, w in sorted(wd.items()) if w > 0]
    total = sum(w for _, w in items)
    vals = [int(round(w / total * 255)) for _, w in items]
    vals[0] += 255 - sum(vals)
    indices = values = 0
    for slot, ((i, _), v) in enumerate(zip(items, vals)):
        indices |= (i + 1) << (8 * slot); values |= v << (8 * slot)
    return values, indices

def path_el(vs, closed=True, pid=None, skin=None, name='Path'):
    p = El('PointsPath', isClosed=True if closed else None, name=name, id=pid)
    for v in vs:
        if v.kind == 'cm':
            e = El('CubicMirroredVertex', x=v.x, y=v.y, rotation=rad(v.a), distance=v.d)
        elif v.kind == 'ca':
            e = El('CubicAsymmetricVertex', x=v.x, y=v.y, rotation=rad(v.a), inDistance=v.din, outDistance=v.dout)
        else:
            e = El('StraightVertex', x=v.x, y=v.y, radius=v.radius if v.radius else None)
        if skin is not None:
            vals, idx = pack(v.w or {0: 1.0})
            if v.kind == 'sv': e.add(El('Weight', values=vals, indices=idx))
            else: e.add(El('CubicWeight', values=vals, indices=idx, inValues=vals, inIndices=idx, outValues=vals, outIndices=idx))
        p.add(e)
    if skin is not None:
        sk = El('Skin', **mat_attrs(skin['bind']), name='Skin')
        for i, (bone_id, bm) in enumerate(skin['tendons']):
            sk.add(El('Tendon', boneId=bone_id, **mat_attrs(bm), name=f"Tendon {i}"))
        p.add(sk)
    return p

# paints ------------------------------------------------------------------
def stop(color, pos): return El('GradientStop', colorValue=color, position=pos)
def radial(cx, cy, r, stops, name='Gradient'):
    g = El('RadialGradient', startX=cx, startY=cy, endX=cx + r, endY=cy, name=name)
    for c, p in stops: g.add(stop(c, p))
    return g
def solid(color): return El('SolidColor', colorValue=color, name='Color')

def skin_paints(bb, highlight=0.6, core=0.5, bounce=0.0):
    """Base radial (focal upper-left) -> core shadow crescent (lower-right) -> soft highlight."""
    if SIL: return [El('Fill', name='Base').add(solid('FF000000'))]
    x0, y0, x1, y1 = bb
    w, h = x1 - x0, y1 - y0
    cx, cy = x0 + 0.30 * w, y0 + 0.25 * h
    r = vdist((cx, cy), (x1, y1))
    paints = [El('Fill', name='Base').add(radial(cx, cy, r, [
        (argb(P.C_LIGHT), 0), (argb(P.C_BASE), 0.40), (argb(P.C_MID), 0.76), (argb(P.C_SHADE), 0.97)]))]
    if bounce > 0:
        paints.append(El('Fill', name='Bounce').add(radial(x0 + 0.5 * w, y1 + 0.35 * h, 0.55 * h, [
            (argb(P.C_BOUNCE, bounce), 0), (argb(P.C_BOUNCE, 0), 1.0)])))
    paints.append(El('Fill', name='Core Shadow').add(radial(x1 + 0.06 * w, y1 + 0.10 * h, 0.78 * max(w, h), [
        (argb(P.C_DEEP, core), 0), (argb(P.C_DEEP, core * 0.55), 0.5), (argb(P.C_DEEP, 0), 1.0)])))
    paints.append(El('Fill', name='Highlight').add(radial(x0 + 0.30 * w, y0 + 0.22 * h, 0.40 * max(w, h), [
        (argb(P.C_HI, highlight), 0), (argb(P.C_HI, highlight * 0.45), 0.5), (argb(P.C_HI, 0), 1.0)])))
    return paints

def soft_stroke(thickness, color, feather, name='Shadow'):
    """Feathered stroke: the format's soft-shadow primitive (Feather only works inside strokes)."""
    return El('Stroke', thickness=thickness, cap='round', join='round', name=name).add(
        solid(color), El('Feather', strength=feather, name='Feather'))
def clip(src_id): return El('ClippingShape', sourceId=src_id, name='Clip')
def ao_shape(name, vs, spec, clip_id, closed=False, x=None, y=None, sid=None):
    if SIL: return None
    sh = El('Shape', x=x, y=y, name=name, id=sid or ids.new())
    sh.add(path_el(vs, closed=closed), soft_stroke(spec['thickness'], argb(P.C_AO, spec['alpha']), spec['feather']), clip(clip_id))
    return sh

# ================================================================== builders
TORSO_FILL_ID = None

HEAD_BACK_ID, HEAD_FRONT_ID = '0:21', '0:36'   # Head Ball (painted first in the head) / Leaf L Shine (painted last)
RULED = []   # (rules_id, default_target_id, above_target_id) for shapes that can be lifted above the head
def ruled(shape):
    if SIL: return shape
    dflt, above, rid = ids.new(), ids.new(), ids.new()
    shape.add(El('DrawRules', drawTargetId=dflt, name='Order', id=rid).add(
        El('DrawTarget', drawableId=HEAD_BACK_ID, placementValue='after', name='Behind Head', id=dflt),
        El('DrawTarget', drawableId=HEAD_FRONT_ID, placementValue='before', name='Above Head', id=above)))
    RULED.append((rid, dflt, above))
    return shape

def hand_variant(name, outline, creases, vid, mirror, liftable=False):
    vs = TL(outline)
    if mirror: vs = mirror_limb(vs)
    node = El('Node', name=name, id=vid)
    shape_id = ids.new()
    if not SIL:
        for i, cr in enumerate(creases):
            crv = TL(cr)
            if mirror: crv = mirror_limb(crv)
            cs = El('Shape', name=f"{name} Crease {i + 1}", id=ids.new()).add(
                path_el(crv, closed=False),
                soft_stroke(P.CREASE['thickness'], argb(P.C_CREASE, P.CREASE['alpha']), P.CREASE['feather'], name='Crease'),
                clip(shape_id))
            node.add(ruled(cs) if liftable else cs)
        wc = TL(P.WRIST_CREASE_L)
        if mirror: wc = mirror_limb(wc)
        ws = ao_shape(f"{name} Wrist Shade", wc, P.WRIST_CREASE, shape_id)
        node.add(ruled(ws) if liftable else ws)
    shape = El('Shape', name=f"{name} Fill", id=shape_id)
    shape.add(path_el(vs))
    for p in skin_paints(bbox(vs), **P.HAND_SHADING): shape.add(p)
    node.add(ruled(shape) if liftable else shape)
    return node

def left_arm_outline():
    a1 = P.ARM_ANGLES[0]; a2 = a1 + P.ARM_ANGLES[1]; am = (a1 + a2) / 2
    r1, r2 = rad(a1), rad(a2)
    d1 = (math.cos(r1), math.sin(r1)); d2 = (math.cos(r2), math.sin(r2))
    n1 = (math.sin(r1), -math.cos(r1)); n2 = (math.sin(r2), -math.cos(r2))   # inner normals (toward the body)
    nm = vnorm(vadd(n1, n2))
    E = vmul(d1, P.UPPER_LEN); Wr = vadd(E, vmul(d2, P.FORE_LEN))
    hs, he, hw = P.ARM_HALF
    an = math.degrees(math.atan2(n1[1], n1[0]))
    pts = [
        (vmul(d1, -P.ARM_CAP_UP), an, 22, {0: 1}),                               # cap top under the head
        (vadd(vmul(n1, hs + P.ARM_INNER_EXTRA), vmul(d1, 4)), a1, 20, {0: 1}),   # inner shoulder, into the torso
        (vadd(E, vmul(nm, he)), am, 18, {0: .5, 1: .5}),                         # inner elbow
        (vadd(Wr, vmul(n2, hw)), a2, 12, {1: 1}),                                # inner wrist
        (vadd(Wr, vmul(d2, 12)), a2 + 90, hw * 0.9, {1: 1}),                     # wrist end cap (under the hand)
        (vsub(Wr, vmul(n2, hw)), a2 - 180, 12, {1: 1}),                          # outer wrist
        (vsub(E, vmul(nm, he)), am - 180, 18, {0: .5, 1: .5}),                   # outer elbow
        (vadd(vmul(n1, -hs), vmul(d1, 2)), a1 - 180, 18, {0: 1}),                # outer shoulder
    ]
    return [cm(p[0], p[1], a, d, w) for p, a, d, w in pts], E, Wr

def build_arm(side):
    mirror = side == 'R'; s = -1 if mirror else 1
    dx = P.ARM_PIVOT_DX_FRAC * W
    pivot_world = (CX - s * dx, YB + P.ARM_PIVOT_BELOW_YB)
    local = (-s * dx, pivot_world[1] - GROUND)
    a1 = P.ARM_ANGLES[0] if not mirror else 180 - P.ARM_ANGLES[0]
    a2rel = P.ARM_ANGLES[1] if not mirror else -P.ARM_ANGLES[1]
    r1, r2 = rad(a1), rad(a2rel)
    outline, E, Wr = left_arm_outline()
    if mirror: outline = mirror_limb(outline); E = (-E[0], E[1]); Wr = (-Wr[0], Wr[1])

    node_world = trs(*pivot_world)
    sh_id, el_id, wr_id = ids.new(), ids.new(), ids.new()
    sh_world = mul(node_world, trs(0, 0, r1))
    el_world = mul(sh_world, trs(P.UPPER_LEN, 0, r2))
    fore_angle = r1 + r2

    arm = El('Node', x=local[0], y=local[1], name=f"Arm_{side}", id=ids.new())
    fill_id = ids.new()

    pr1 = rad(POSE.get(f'shoulder_{side}', a1)); pr2 = rad(POSE.get(f'elbow_{side}', a2rel))
    shoulder = El('RootBone', x=0, y=0, length=P.UPPER_LEN, rotation=pr1, name=f"Shoulder_{side}", id=sh_id)
    elbow = El('Bone', length=P.FORE_LEN, rotation=pr2, name=f"Elbow_{side}", id=el_id)
    wrist = El('Bone', length=P.WRIST_LEN, rotation=0, name=f"Wrist_{side}", id=wr_id)

    mitten_id, fist_id, palm_id, thumb_id = ids.new(), ids.new(), ids.new(), ids.new()
    hand_ids = dict(Mitten=mitten_id, Fist=fist_id, OpenPalm=palm_id, ThumbUp=thumb_id)
    solo = El('Solo', rotation=-fore_angle, activeComponentId=hand_ids[POSE.get(f'hand_{side}', 'Mitten')], name=f"Hand_{side}", id=ids.new())
    lift = side == 'L'
    solo.add(hand_variant('Mitten', P.MITTEN_L, P.MITTEN_CREASES_L, mitten_id, mirror, lift),
             hand_variant('Fist', P.FIST_L, P.FIST_CREASES_L, fist_id, mirror, lift),
             hand_variant('OpenPalm', P.OPENPALM_L, P.OPENPALM_CREASES_L, palm_id, mirror, lift),
             hand_variant('ThumbUp', P.THUMBUP_L, P.THUMBUP_CREASES_L, thumb_id, mirror, lift))
    wrist.add(solo); elbow.add(wrist)

    frame = El('Node', rotation=-r1, name=f"Shoulder_{side} Frame")   # screen-aligned frame riding the upper arm
    head_local = (HEAD_CX - pivot_world[0], HEAD_CY - pivot_world[1] + P.SHOULDER_AO['push'])
    frame.add(ao_shape(f"ShoulderAO_{side}", TL(HEAD_BALL), P.SHOULDER_AO, fill_id, closed=True, x=head_local[0], y=head_local[1]))
    # cast shadow on the torso along the inner edge; DrawRules puts it behind the arm tube
    n1 = (s * math.sin(r1), -s * math.cos(r1)); off = P.ARM_CAST['offset']
    castv = [v.copy(x=v.x + off * n1[0], y=v.y + off * n1[1]) for v in outline[1:4]]
    spec = P.ARM_CAST[side]
    cast = ao_shape(f"ArmCast_{side}", castv, spec, TORSO_FILL_ID)
    cast_id = cast.attrs['id'] if cast is not None else None
    if cast is not None:
        dt_id = ids.new()
        cast.add(El('DrawRules', drawTargetId=dt_id, name='Behind Arm', id=ids.new()).add(
            El('DrawTarget', drawableId=fill_id, placementValue='after', name='After Arm', id=dt_id)))
        frame.add(cast)
    shoulder.add(frame, elbow)
    arm.add(shoulder)

    skin = {'bind': node_world, 'tendons': [(sh_id, sh_world), (el_id, el_world)]}
    tube = El('Shape', name=f"Arm_{side}_Fill", id=fill_id)
    tube.add(path_el(outline, skin=skin))
    for p in skin_paints(bbox(outline), **P.ARM_SHADING): tube.add(p)
    arm.add(tube)
    return arm, dict(pivot_world=pivot_world, shoulder_id=sh_id, elbow_id=el_id, wrist_id=wr_id, solo_id=solo.attrs['id'],
                     hands=dict(Mitten=mitten_id, Fist=fist_id, OpenPalm=palm_id, ThumbUp=thumb_id),
                     r1=r1, r2=r2, E=E, Wr=Wr, node_id=arm.attrs['id'], fill_id=fill_id, cast_id=cast_id, rest=(a1, a2rel))

def build_leg(side):
    mirror = side == 'R'; s = -1 if mirror else 1
    dx = P.LEG_DX_FRAC * W
    pivot_world = (CX - s * dx, GROUND - P.LEG_PIVOT_ABOVE_GROUND)
    local = (-s * dx, -P.LEG_PIVOT_ABOVE_GROUND)
    outline = TL(P.LEG_L); foot = TL(P.FOOT_L)
    if mirror: outline = mirror_limb(outline); foot = mirror_limb(foot)
    node_world = trs(*pivot_world)
    hip_id, knee_id, ankle_id, target_id = ids.new(), ids.new(), ids.new(), ids.new()
    r0 = rad(90)
    hip_world = mul(node_world, trs(0, 0, r0))
    knee_world = mul(hip_world, trs(P.HIP_LEN, 0, 0))

    leg = El('Node', x=local[0], y=local[1], name=f"Leg_{side}", id=ids.new())
    fill_id = ids.new(); foot_fill_id = ids.new()
    leg.add(El('Node', x=0, y=P.HIP_LEN + P.SHIN_LEN, name=f"Foot_{side}_Target", id=target_id))

    hip = El('RootBone', x=0, y=0, length=P.HIP_LEN, rotation=rad(POSE.get(f'hip_{side}', 90)), name=f"Hip_{side}", id=hip_id)
    knee = El('Bone', length=P.SHIN_LEN, rotation=rad(POSE.get(f'knee_{side}', 0)), name=f"Knee_{side}", id=knee_id)
    ik_id = ids.new()
    knee.add(El('IKConstraint', targetId=target_id, parentBoneCount=1, invertDirection=(not mirror), strength=POSE.get('ik', 1), name=f"IK_{side}", id=ik_id))
    ankle = El('Bone', length=P.ANKLE_LEN, rotation=0, name=f"Ankle_{side}", id=ankle_id)
    foot_node = El('Node', rotation=-r0 + rad(-P.FOOT_TILT_DEG if not mirror else P.FOOT_TILT_DEG), name=f"Foot_{side}", id=ids.new())
    foot_shape = El('Shape', name=f"Foot_{side}_Fill", id=foot_fill_id)
    foot_shape.add(path_el(foot))
    for p in skin_paints(bbox(foot), **P.FOOT_SHADING): foot_shape.add(p)
    foot_node.add(foot_shape); ankle.add(foot_node); knee.add(ankle)

    frame = El('Node', rotation=-r0, name=f"Hip_{side} Frame")
    bv = TL(P.BELLY_AO_L); iv = TL(P.INNER_AO_L)
    if mirror: bv = mirror_limb(bv); iv = mirror_limb(iv)
    frame.add(ao_shape(f"Belly_AO_{side}", bv, P.BELLY_AO, fill_id), ao_shape(f"InnerAO_{side}", iv, P.INNER_AO, fill_id))
    hip.add(frame, knee); leg.add(hip)

    skin = {'bind': node_world, 'tendons': [(hip_id, hip_world), (knee_id, knee_world)]}
    shape = El('Shape', name=f"Leg_{side}_Fill", id=fill_id)
    shape.add(path_el(outline, skin=skin))
    for p in skin_paints(bbox(outline), **P.LEG_SHADING): shape.add(p)
    leg.add(shape)
    return leg, dict(pivot_world=pivot_world, hip_id=hip_id, knee_id=knee_id, ankle_id=ankle_id, target_id=target_id,
                     node_id=leg.attrs['id'], foot_node_id=foot_node.attrs['id'], fill_id=fill_id, foot_fill_id=foot_fill_id,
                     ik_id=ik_id, foot_rest_rot=-r0 + rad(-P.FOOT_TILT_DEG if not mirror else P.FOOT_TILT_DEG))

def build_torso():
    global TORSO_FILL_ID
    torso_y = round(YB + 0.58 * H)                    # 754: crotch arch top / hips
    torso = El('Node', x=0, y=torso_y - GROUND, name='Torso', id=ids.new())
    fill_id = ids.new(); TORSO_FILL_ID = fill_id
    head_local = (HEAD_CX - CX, HEAD_CY - torso_y)
    if not SIL:
        for nm, dy, thick, alpha, feather in (('HeadContact_AO', 8, 26, 0.45, 12), ('HeadContact_AO Wide', 14, 54, 0.20, 20)):
            torso.add(ao_shape(nm, TL(HEAD_BALL), dict(thickness=thick, alpha=alpha, feather=feather), fill_id,
                               closed=True, x=head_local[0], y=head_local[1] + dy))
    torso.add(ao_shape('Crotch_AO', [sv(-10, -8), sv(10, -4)], P.CROTCH_AO, fill_id))
    outline = symmetric_closed(TL(P.TORSO_RIGHT))
    shape = El('Shape', name='Torso_Fill', id=fill_id)
    shape.add(path_el(outline))
    for p in skin_paints(bbox(outline), **P.TORSO_SHADING): shape.add(p)
    torso.add(shape)
    return torso, dict(node_id=torso.attrs['id'], fill_id=fill_id, world_y=torso_y)

GROUND_IDS = {}
def build_ground():
    if SIL: return []
    out = []
    fc = P.FOOT_CONTACT; dx = P.LEG_DX_FRAC * W
    for side, s in (('L', 1), ('R', -1)):
        sh = El('Shape', x=-s * (dx + fc['dx_out']), y=fc['dy'], name=f"FootContact_{side}", id=ids.new())
        sh.add(path_el([sv(-fc['half_len_out'] * s, 0), sv(fc['half_len_in'] * s, 0)], closed=False),
               soft_stroke(fc['thickness'], argb(P.C_GROUND, fc['alpha']), fc['feather']))
        out.append(sh); GROUND_IDS[f'contact_{side}'] = sh.attrs['id']
    g = P.GROUND_SHADOW
    gs = El('Shape', x=0, y=g['dy'], name='GroundShadow', id=ids.new())
    gs.add(path_el([sv(-g['half_len'], 0), sv(g['half_len'], 0)], closed=False),
           soft_stroke(g['thickness'], argb(P.C_GROUND, g['alpha']), g['feather']))
    out.append(gs); GROUND_IDS['shadow'] = gs.attrs['id']
    return out

# ================================================================== head block (verbatim)
def head_block():
    lines = open(BACKUP).read().split('\n')
    start = next(i for i, l in enumerate(lines) if l.strip().startswith('<Node x="320" y="380" name="Head" id="0:20">'))
    end = next(i for i, l in enumerate(lines) if 'ARMS' in l and '=====' in l)
    while lines[end].strip() != '</Node>': end -= 1
    block = lines[start:end + 1]
    first = block[0].replace('x="320" y="380"', 'x="0" y="-174"', 1)
    assert first != block[0]
    block[0] = first
    text = '\n'.join(('        ' + l) if l.strip() else l for l in block) + '\n'
    if SIL:
        text = re.sub(r'colorValue="[0-9A-Fa-f]{8}"', 'colorValue="FF000000"', text)
    return text

# ================================================================== animation helpers
KEY_X, KEY_Y, KEY_ROT, KEY_SX, KEY_SY, KEY_OPACITY, KEY_SOLO, KEY_STRENGTH = 13, 14, 15, 16, 17, 18, 296, 172
def kf(value, frame, ease=True):
    k = El('KeyFrameDouble', value=value, frame=frame, interpolationType='cubic' if ease else 'linear')
    if ease: k.add(El('CubicEaseInterpolator', x1=0.42, y1=0, x2=0.58, y2=1))
    return k
def kfid(value, frame): return El('KeyFrameId', value=value, frame=frame, interpolationType='hold')
def keyed_mixed(obj_id, tracks):
    """tracks: list of (propertyKey, kind, [(frame, value)...]) with kind 'd' (double, eased) or 'id' (hold)"""
    ko = El('KeyedObject', objectId=obj_id)
    for key, kind, frames in tracks:
        kp = El('KeyedProperty', propertyKey=key)
        for f, v in frames: kp.add(kf(v, f) if kind == 'd' else kfid(v, f))
        ko.add(kp)
    return ko
def keyed(obj_id, props):
    ko = El('KeyedObject', objectId=obj_id)
    for key, frames in props.items():
        kp = El('KeyedProperty', propertyKey=key)
        for v, f in frames: kp.add(kf(v, f))
        ko.add(kp)
    return ko

# ================================================================== pose library (phase 2)
KEY_DRAW_TARGET = 121
def build_poses(info):
    """Returns (animations, triggers, layer). Each pose: ease in (0-15), hold, ease out to rest; one-shot."""
    L, R, LL, LR, G = info['arm_l'], info['arm_r'], info['leg_l'], info['leg_r'], GROUND_IDS
    body_id, head_id, torso_id = info['body_id'], info['head_pivot_id'], info['torso']['node_id']
    hy = YB - GROUND
    aL, eL = L['rest']; aR, eR = R['rest']
    anims, triggers, states = [], [], []
    def anim(name, duration, tracks):
        a = El('LinearAnimation', loopValue='oneShot', fps=60, duration=duration, name=name, id=ids.new())
        for obj, trk in tracks: a.add(keyed_mixed(obj, trk))
        return a
    def env(v_rest, v_pose, t_in=15, t_hold=60, t_end=78):
        return [(0, v_rest), (t_in, v_pose), (t_hold, v_pose), (t_end, v_rest)]
    def deg_env(rest_deg, pose_deg, **kw): return env(rad(rest_deg), rad(pose_deg), **kw)
    def lift_hand(frames):   # draw the left hand above the head between the given frames
        out = []
        for rid, dflt, above in RULED:
            out.append((rid, [(KEY_DRAW_TARGET, 'id', [(0, dflt), (frames[0], above), (frames[1], dflt)])]))
        return out

    # --- Cheer: both arms up with fists, body lifted, right leg tucked, ground shadow shrinks
    t = [
        (L['shoulder_id'], [(KEY_ROT, 'd', [(0, rad(aL)), (10, rad(aL + 8)), (24, rad(232)), (62, rad(236)), (84, rad(aL))])]),
        (R['shoulder_id'], [(KEY_ROT, 'd', [(0, rad(aR)), (10, rad(aR - 8)), (24, rad(-52)), (62, rad(-56)), (84, rad(aR))])]),
        (L['elbow_id'], [(KEY_ROT, 'd', [(0, rad(eL)), (24, rad(-14)), (62, rad(-14)), (84, rad(eL))])]),
        (R['elbow_id'], [(KEY_ROT, 'd', [(0, rad(eR)), (24, rad(14)), (62, rad(14)), (84, rad(eR))])]),
        (L['solo_id'], [(KEY_SOLO, 'id', [(0, L['hands']['Mitten']), (6, L['hands']['Fist']), (80, L['hands']['Mitten'])])]),
        (R['solo_id'], [(KEY_SOLO, 'id', [(0, R['hands']['Mitten']), (6, R['hands']['Fist']), (80, R['hands']['Mitten'])])]),
        (body_id, [(KEY_Y, 'd', [(0, 0), (10, 7), (26, -22), (62, -22), (84, 0)])]),
        (head_id, [(KEY_Y, 'd', [(0, hy), (10, hy + 9), (28, hy - 24), (62, hy - 22), (84, hy)])]),
        (LR['ik_id'], [(KEY_STRENGTH, 'd', [(0, 1), (10, 1), (12, 0), (70, 0), (72, 1)])]),
        (LR['hip_id'], [(KEY_ROT, 'd', [(0, rad(90)), (12, rad(90)), (28, rad(68)), (62, rad(68)), (78, rad(90))])]),
        (LR['knee_id'], [(KEY_ROT, 'd', [(0, 0), (12, 0), (28, rad(-75)), (62, rad(-75)), (78, 0)])]),
        (G['shadow'], [(KEY_SX, 'd', [(0, 1), (10, 1.04), (26, 0.7), (62, 0.7), (84, 1)]), (KEY_OPACITY, 'd', [(0, 1), (26, 0.6), (62, 0.6), (84, 1)])]),
        (G['contact_L'], [(KEY_OPACITY, 'd', [(0, 1), (26, 0.25), (62, 0.25), (84, 1)])]),
        (G['contact_R'], [(KEY_OPACITY, 'd', [(0, 1), (26, 0.25), (62, 0.25), (84, 1)])]),
    ]
    anims.append(('Cheer', anim('Cheer', 84, t)))

    # --- Stop: left arm up with the open palm beside the head (hand drawn above the head), weight on one leg
    t = [
        (L['shoulder_id'], [(KEY_ROT, 'd', deg_env(aL, 192))]),
        (L['elbow_id'], [(KEY_ROT, 'd', deg_env(eL, -100 - 192 + 360))]),   # forearm world angle -100 (straight up, a touch outward)
        (L['solo_id'], [(KEY_SOLO, 'id', [(0, L['hands']['Mitten']), (4, L['hands']['OpenPalm']), (76, L['hands']['Mitten'])])]),
        (L['cast_id'], [(KEY_OPACITY, 'd', env(1, 0, t_in=6, t_hold=70, t_end=78))]),
        (R['shoulder_id'], [(KEY_ROT, 'd', deg_env(aR, aR - 8))]),
        (body_id, [(KEY_ROT, 'd', env(0, 0.035)), (KEY_X, 'd', env(0, -4))]),
        (head_id, [(KEY_ROT, 'd', env(0, 0.05)), (KEY_X, 'd', env(0, -14)), (KEY_Y, 'd', env(hy, hy + 2))]),
        (LL['target_id'], [(KEY_Y, 'd', env(P.HIP_LEN + P.SHIN_LEN, P.HIP_LEN + P.SHIN_LEN - 4))]),
    ] + lift_hand((4, 76))
    anims.append(('Stop', anim('Stop', 78, t)))

    # --- Walk: two front-facing step cycles; knees lift alternately, feet roll, arms swing, body bobs
    n = 96; c = 48
    def cyc(vals):   # vals over one cycle at quarter points [0, 12, 24, 36], repeated twice, closing at 96
        out = []
        for k in range(2):
            for i, v in enumerate(vals): out.append((k * c + i * 12, v))
        out.append((n, vals[0])); return out
    tgt = P.HIP_LEN + P.SHIN_LEN
    t = [
        (LL['target_id'], [(KEY_Y, 'd', cyc([tgt, tgt - 15, tgt, tgt]))]),
        (LR['target_id'], [(KEY_Y, 'd', cyc([tgt, tgt, tgt, tgt - 15]))]),
        (LL['foot_node_id'], [(KEY_ROT, 'd', cyc([LL['foot_rest_rot'], LL['foot_rest_rot'] - rad(14), LL['foot_rest_rot'] + rad(4), LL['foot_rest_rot']]))]),
        (LR['foot_node_id'], [(KEY_ROT, 'd', cyc([LR['foot_rest_rot'], LR['foot_rest_rot'], LR['foot_rest_rot'] - rad(4), LR['foot_rest_rot'] + rad(14)]))]),
        (L['shoulder_id'], [(KEY_ROT, 'd', cyc([rad(aL), rad(aL + 18), rad(aL), rad(aL - 18)]))]),
        (R['shoulder_id'], [(KEY_ROT, 'd', cyc([rad(aR), rad(aR + 18), rad(aR), rad(aR - 18)]))]),
        (L['elbow_id'], [(KEY_ROT, 'd', cyc([rad(eL), rad(eL - 10), rad(eL), rad(eL + 6)]))]),
        (R['elbow_id'], [(KEY_ROT, 'd', cyc([rad(eR), rad(eR - 6), rad(eR), rad(eR + 10)]))]),
        (body_id, [(KEY_Y, 'd', cyc([0, -5, 0, -5]))]),
        (head_id, [(KEY_Y, 'd', cyc([hy, hy - 6, hy, hy - 6])), (KEY_ROT, 'd', cyc([0, 0.03, 0, -0.03]))]),
        (torso_id, [(KEY_ROT, 'd', cyc([0, 0.02, 0, -0.02]))]),
    ]
    anims.append(('Walk', anim('Walk', n, t)))

    # --- ArmsCrossed: forearms folded over the upper belly, left over right, shoulders raised
    t = [
        (L['shoulder_id'], [(KEY_ROT, 'd', deg_env(aL, 100))]),
        (L['elbow_id'], [(KEY_ROT, 'd', deg_env(eL, -8 - 100))]),     # left forearm world angle -8 (across, slightly up)
        (R['shoulder_id'], [(KEY_ROT, 'd', deg_env(aR, 78))]),
        (R['elbow_id'], [(KEY_ROT, 'd', deg_env(eR, 190 - 78))]),     # right forearm world angle 190 (across the other way)
        (L['node_id'], [(KEY_Y, 'd', env(YB + P.ARM_PIVOT_BELOW_YB - GROUND, YB + P.ARM_PIVOT_BELOW_YB - GROUND - 4))]),
        (R['node_id'], [(KEY_Y, 'd', env(YB + P.ARM_PIVOT_BELOW_YB - GROUND, YB + P.ARM_PIVOT_BELOW_YB - GROUND - 4))]),
        (L['cast_id'], [(KEY_OPACITY, 'd', env(1, 0, t_in=6, t_hold=70))]),
        (R['cast_id'], [(KEY_OPACITY, 'd', env(1, 0, t_in=6, t_hold=70))]),
        (head_id, [(KEY_Y, 'd', env(hy, hy + 3))]),
    ]
    anims.append(('ArmsCrossed', anim('ArmsCrossed', 78, t)))

    # --- ThumbsUp: left arm forward, thumb up at chest height (hand above the head's chin), slight lean
    t = [
        (L['shoulder_id'], [(KEY_ROT, 'd', deg_env(aL, 96))]),
        (L['elbow_id'], [(KEY_ROT, 'd', deg_env(eL, -50 - 96))]),      # forearm world angle -50 (up and in)
        (L['solo_id'], [(KEY_SOLO, 'id', [(0, L['hands']['Mitten']), (5, L['hands']['ThumbUp']), (76, L['hands']['Mitten'])])]),
        (L['cast_id'], [(KEY_OPACITY, 'd', env(1, 0, t_in=6, t_hold=70))]),
        (R['shoulder_id'], [(KEY_ROT, 'd', deg_env(aR, aR - 6))]),
        (body_id, [(KEY_ROT, 'd', env(0, -0.045))]),
        (head_id, [(KEY_ROT, 'd', env(0, -0.06)), (KEY_X, 'd', env(0, 14)), (KEY_Y, 'd', env(hy, hy + 1))]),
    ] + lift_hand((5, 76))
    anims.append(('ThumbsUp', anim('ThumbsUp', 78, t)))

    # --- state machine layer: Rest (empty) -> pose on its trigger; back to Rest after the pose plays
    rest_anim = El('LinearAnimation', loopValue='loop', fps=60, duration=60, name='Rest', id=ids.new())
    layer = El('StateMachineLayer', name='Poses', id=ids.new())
    rest_state_id = ids.new()
    layer.add(El('AnyState', x=200, y=-120), El('ExitState', x=400, y=-120),
              El('EntryState', x=0, y=16).add(El('StateTransition', stateToId=rest_state_id)))
    rest_state = El('AnimationState', x=160, y=0, animationId=rest_anim.attrs['id'], id=rest_state_id)
    pose_states = []
    for i, (name, a) in enumerate(anims):
        trig = El('StateMachineTrigger', name=name, id=ids.new()); triggers.append(trig)
        sid = ids.new()
        rest_state.add(El('StateTransition', stateToId=sid, duration=120).add(El('TransitionTriggerCondition', inputId=trig.attrs['id'])))
        st = El('AnimationState', x=420, y=i * 90, animationId=a.attrs['id'], reset=True, id=sid)
        st.add(El('StateTransition', stateToId=rest_state_id, duration=220, enableExitTime=True, exitTimeIsPercetange=True, exitTime=100))
        pose_states.append(st)
    layer.add(rest_state, *pose_states)
    return [rest_anim] + [a for _, a in anims], triggers, layer

# ================================================================== assemble
def build():
    global ids, RULED, GROUND_IDS
    ids = Ids(200); RULED = []; GROUND_IDS = {}
    art = El('Artboard', defaultStateMachineId='0:7', styleId='0:5', width=P.ART_W, height=P.ART_H, name='Moz', id='0:2')
    art.add(El('LayoutComponentStyle', name='Artboard Style', id='0:5'))
    art.add(comment('Design-time background, removed for the shipped file.', 2))
    art.add(El('Fill', name='Background').add(El('SolidColor', colorValue='FFF7F4EE', name='Color')))

    root = El('Node', x=CX, y=GROUND, name='Root', id=ids.new())
    head_pivot_id = ids.new()
    head_pivot = El('Node', x=0, y=YB - GROUND, name='Head Pivot', id=head_pivot_id)
    head_pivot.add(Raw(head_block()))

    body = El('Node', x=0, y=0, name='Body', id=ids.new())
    torso, torso_info = build_torso()
    arm_l, arm_l_info = build_arm('L'); arm_r, arm_r_info = build_arm('R')
    leg_l, leg_l_info = build_leg('L'); leg_r, leg_r_info = build_leg('R')
    body.add(comment('Draw order is declaration order, first on top: arms over the torso over the legs.', 3))
    body.add(arm_l, arm_r, torso, leg_l, leg_r)

    root.add(comment('HEAD: approved artwork, untouched; only re-parented under a bottom-centre pivot.', 3), head_pivot)
    root.add(comment('BODY: pear torso, tapered skinned arms with Solo mitten hands, chubby IK legs; one key light upper-left.', 3), body)
    root.add(comment('Ground: contact shadows under the feet and a soft ground ellipse.', 3), *build_ground())
    art.add(comment('Root sits on the ground line between the feet; scale or move the whole character here.', 2), root)

    I = P.IDLE; n = I['frames']; h = n // 2
    r1l, r1r = arm_l_info['r1'], arm_r_info['r1']; sway = rad(I['arm_sway_deg'])
    idle = El('LinearAnimation', loopValue='loop', fps=60, duration=n, name='Idle', id='0:6')
    if not NO_IDLE: idle.add(keyed(torso_info['node_id'], {KEY_SX: [(1, 0), (I['torso_sx'], h), (1, n)], KEY_SY: [(1, 0), (I['torso_sy'], h), (1, n)]}))
    hy = YB - GROUND
    if not NO_IDLE:
        idle.add(keyed(head_pivot_id, {KEY_Y: [(hy, 0), (hy - I['head_bob'], h), (hy, n)]}))
        idle.add(keyed(arm_l_info['shoulder_id'], {KEY_ROT: [(r1l - sway, 0), (r1l + sway, h), (r1l - sway, n)]}))
        idle.add(keyed(arm_r_info['shoulder_id'], {KEY_ROT: [(r1r + sway, 0), (r1r - sway, h), (r1r + sway, n)]}))
    art.add(idle)

    info = dict(arm_l=arm_l_info, arm_r=arm_r_info, leg_l=leg_l_info, leg_r=leg_r_info, torso=torso_info,
                head_pivot_id=head_pivot_id, root_id=root.attrs['id'], body_id=body.attrs['id'],
                ruler=dict(H=H, W=W, CX=CX, YB=YB, GROUND=GROUND))
    pose_anims, triggers, pose_layer = ([], [], None) if (SIL or NO_IDLE) else build_poses(info)
    for a in pose_anims: art.add(a)

    sm = El('StateMachine', name='State Machine 1', id='0:7')
    for tr in triggers: sm.add(tr)
    if TEST_HITS:
        hits = El('Node', name='TEST HITS', id=ids.new())
        for i, tr in enumerate(triggers):
            hid = ids.new()
            hits.add(El('Shape', x=60 + 120 * i, y=30, name=f"Hit {tr.attrs['name']}", id=hid).add(
                El('Rectangle', width=60, height=60, originX=0.5, originY=0.5, name='P'),
                El('Fill', name='F').add(El('SolidColor', colorValue='00000000', name='C'))))
            sm.add(El('StateMachineListenerSingle', targetId=hid, listenerTypeValue='click', name=f"Fire {tr.attrs['name']}", id=ids.new()).add(
                El('ListenerTriggerChange', inputId=tr.attrs['id'])))
        art.kids.insert(3, hits)   # before Root: on top of everything
    layer = El('StateMachineLayer', name='Layer 1', id='0:8')
    layer.add(El('AnyState', x=200, y=-120), El('ExitState', x=400, y=-120),
              El('EntryState', x=0, y=16).add(El('StateTransition', stateToId='0:12')),
              El('AnimationState', x=200, animationId='0:6', id='0:12'))
    sm.add(layer)
    if pose_layer is not None: sm.add(pose_layer)
    art.add(sm)

    doc = '<Rive version="1" kind="fragment">\n'
    doc += '    <!-- Moz, the Mozy sprout mascot. Head: approved artwork (untouched). Body: generated by\n'
    doc += '         tools/gen_body.py from tools/body_params.py (edit the params, re-run, never hand-edit the body).\n'
    doc += '         Pear torso, tapered skinned arms with Solo mitten hands, chubby IK legs, contact shadows,\n'
    doc += '         breathing idle. Artboard 640x880; Root sits on the ground line between the feet. -->\n'
    doc += art.xml(1) + '</Rive>\n'
    info['triggers'] = {t.attrs['name']: t.attrs['id'] for t in triggers}
    return doc, info

if __name__ == '__main__':
    out = OUT
    if '--silhouette' in sys.argv:
        SIL = True; out = sys.argv[sys.argv.index('--silhouette') + 1]
    if '--out' in sys.argv: out = sys.argv[sys.argv.index('--out') + 1]
    if '--no-idle' in sys.argv: NO_IDLE = True
    if '--test-hits' in sys.argv: TEST_HITS = True
    if '--pose' in sys.argv:
        for kv in sys.argv[sys.argv.index('--pose') + 1].split(','):
            k, v = kv.split('='); POSE[k] = v if k.startswith('hand') else float(v)
    doc, info = build()
    open(out, 'w').write(doc)
    json.dump(info, open(os.path.join(PROJECT, 'build', 'body_info.json'), 'w'), indent=1, default=str)
    print('wrote', out, len(doc), 'bytes')
