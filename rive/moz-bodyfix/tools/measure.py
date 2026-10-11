"""Landmark table: targets from the brief (head as the ruler) vs. what the generator built,
plus silhouette extents read from a rendered silhouette PNG. Usage: measure.py [sil.png]"""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_body as G, body_params as P
from PIL import Image

H, W, CX, YB, GROUND = G.H, G.W, G.CX, G.YB, G.GROUND
rows = []
def row(name, target, actual, unit='px'):
    dev = (actual - target) / target * 100 if target else 0
    rows.append((name, target, actual, dev))

torso = G.symmetric_closed(G.TL(P.TORSO_RIGHT))
def xw_at(vs, y_local):
    """width of a closed symmetric outline at a given local y (sample the beziers)"""
    pts = sample_closed(vs)
    xs = [x for x, y in pts if abs(y - y_local) < 1.5]
    return (max(xs) - min(xs)) if xs else float('nan')
def sample_closed(vs, n=60):
    pts = []
    m = len(vs)
    for i in range(m):
        a, b = vs[i], vs[(i + 1) % m]
        ao = (a.dout if a.kind == 'ca' else a.d); bi = (b.din if b.kind == 'ca' else b.d)
        p0 = (a.x, a.y); p3 = (b.x, b.y)
        p1 = (a.x + ao * math.cos(G.rad(a.a)), a.y + ao * math.sin(G.rad(a.a)))
        p2 = (b.x - bi * math.cos(G.rad(b.a)), b.y - bi * math.sin(G.rad(b.a)))
        for k in range(n):
            t = k / n
            x = (1-t)**3*p0[0] + 3*(1-t)**2*t*p1[0] + 3*(1-t)*t**2*p2[0] + t**3*p3[0]
            y = (1-t)**3*p0[1] + 3*(1-t)**2*t*p1[1] + 3*(1-t)*t**2*p2[1] + t**3*p3[1]
            pts.append((x, y))
    return pts
torso_y = round(YB + 0.58 * H)
row('Visible body, head bottom -> soles', 0.80 * H, GROUND - YB)
row('Torso top above head bottom (hidden)', 0.10 * H, YB - (torso_y + min(v.y for v in torso)))
row('Torso width at shoulder line (yB+0.03H)', 0.40 * W, xw_at(torso, (YB + 0.03 * H) - torso_y))
tp = sample_closed(torso); widest = max(tp, key=lambda p: p[0])
row('Belly widest: y below head bottom', 0.36 * H, (torso_y + widest[1]) - YB)
row('Belly widest: width', 0.58 * W, 2 * widest[0])
row('Crotch arch top below head bottom', 0.58 * H, torso_y - YB)
row('Ground line below head bottom', 0.80 * H, GROUND - YB)
row('Leg centre offset from cx', 0.165 * W, P.LEG_DX_FRAC * W)
leg = G.TL(P.LEG_L); lp = sample_closed(leg)
def leg_width_at(yl):
    xs = [x for x, y in lp if abs(y - yl) < 1.5]; return max(xs) - min(xs)
row('Leg width at thigh (just below the belly)', 0.26 * W, leg_width_at(48))
row('Leg width at ankle', 0.22 * W, leg_width_at(88))
foot = G.TL(P.FOOT_L); fb = G.bbox(foot)
row('Foot width', 0.27 * W, fb[2] - fb[0]); row('Foot height', 0.10 * H, fb[3] - fb[1])
inner_top = max(x for x, y in lp if abs(y - 48) < 1.5); inner_ankle = max(x for x, y in lp if abs(y - 88) < 1.5)
row('Gap between legs at top', 0.07 * W, 2 * (P.LEG_DX_FRAC * W - inner_top))
row('Gap between legs at ankles', 0.11 * W, 2 * (P.LEG_DX_FRAC * W - inner_ankle))
row('Shoulder pivot offset from cx', 0.22 * W, P.ARM_PIVOT_DX_FRAC * W)
row('Arm thickness upper', 0.12 * W, 2 * P.ARM_HALF[0]); row('Arm thickness wrist', 0.10 * W, 2 * P.ARM_HALF[2])
outline, E, Wr = G.left_arm_outline(); hand = G.TL(P.MITTEN_L); hb = G.bbox(hand)
a2 = P.ARM_ANGLES[0] + P.ARM_ANGLES[1]; d2 = (math.cos(G.rad(a2)), math.sin(G.rad(a2)))
tip = (Wr[0] + d2[0] * (hb[3]), Wr[1] + d2[1] * (hb[3]))
row('Arm length pivot -> hand tip', 0.44 * H, math.hypot(*tip))
row('Hand width', 0.155 * W, hb[2] - hb[0]); row('Hand height', 0.17 * W, hb[3] - hb[1])
row('Thumb nub', 0.05 * W, 18)
sil = sys.argv[1] if len(sys.argv) > 1 else None
if sil and os.path.exists(sil):
    im = Image.open(sil).convert('L'); px = im.load(); w, h = im.size
    body_xs = [x for y in range(int(YB), int(GROUND)) for x in range(w) if px[x, y] < 60]
    row('Total width incl. relaxed arms (<= target)', 0.72 * W, max(body_xs) - min(body_xs) + 1)
    sole = max(y for y in range(h) for x in range(w // 2 - 100, w // 2 + 100) if px[x, y] < 60)
    row('Soles y (from silhouette) below head bottom', 0.80 * H, sole - YB)
print(f"Ruler: H={H:.0f} W={W:.0f} cx={CX:.0f} yB={YB:.0f} ground={GROUND}")
print(f"{'landmark':48s} {'target':>8s} {'built':>8s} {'dev%':>7s}")
for n, t, a, d in rows: print(f"{n:48s} {t:8.1f} {a:8.1f} {d:+7.1f}")
