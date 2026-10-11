"""Tunable geometry and shading for the Moz body. Every number is in the local space
of its part (documented per block). Vertex tuples: ('cm', x, y, angleDeg, dist[, weights]),
('ca', x, y, angleDeg, inDist, outDist[, weights]), ('sv', x, y[, weights]).
Weights map tendon index -> share (0 = first bone of that limb)."""

# ---------------------------------------------------------------- canvas
ART_W, ART_H = 640, 880

# ---------------------------------------------------------------- colours (head ramp only)
C_HI, C_LIGHT, C_BASE, C_MID, C_SHADE = 'FEF9EF', 'FDF4E4', 'F8EBD4', 'EFDBBB', 'E0C098'
C_DEEP, C_AO, C_GROUND, C_CREASE, C_BOUNCE = 'C9A47C', '8A6646', '6B4E36', 'C9A47C', 'E9CDAA'

# ---------------------------------------------------------------- torso (origin: hips/bottom-centre, y up is negative)
# right half, top -> bottom; mirrored automatically
TORSO_RIGHT = [
    ('cm', 0, -236, 0, 46),            # top, hidden inside the head (world 518)
    ('cm', 82, -190, 72, 50),          # shoulder line (world 564), 0.42 W wide; bulges out fast under the head
    ('ca', 114.5, -80, 90, 70, 45),    # widest belly (world 672), 0.58 W; vertical tangent
    ('cm', 0, 0, 180, 63),             # crotch: the belly bottom is one round quadrant (world 754)
]
TORSO_SHADING = dict(highlight=0.5, core=0.6, bounce=0.12)

# ---------------------------------------------------------------- legs (origin: hip pivot, +x = inner side for the LEFT leg)
LEG_DX_FRAC = 0.165           # leg centres at cx +- 0.165 W
LEG_PIVOT_ABOVE_GROUND = 117  # hip pivot hidden inside the torso
HIP_LEN, SHIN_LEN, ANKLE_LEN = 52, 36, 12   # ankle at local y = 88
LEG_L = [
    ('cm', 0, -52, 0, 36, {0: 1}),                   # top cap, hidden inside the belly
    ('cm', 54, -12, 70, 14, {0: 1}),                 # inner upper, hidden
    ('ca', 63, 22, 100, 12, 10, {0: .85, 1: .15}),   # arch apex, hidden just above the crotch
    ('cm', 52, 50, 108, 12, {0: .4, 1: .6}),         # arch shoulder: the gap is ~26px here and rounded above
    ('cm', 43, 90, 100, 14, {1: 1}),                 # inner ankle
    ('cm', 0, 106, 180, 30, {1: 1}),                 # bottom, hidden under the foot
    ('cm', -43, 90, 260, 14, {1: 1}),                # outer ankle
    ('cm', -51, 44, 270, 24, {0: .85, 1: .15}),      # outer thigh, vertical, continues the belly's side
    ('cm', -50, -24, 275, 22, {0: 1}),               # outer hip at the belly's widest (hidden)
]
LEG_SHADING = dict(highlight=0.45, core=0.55)
# foot: origin at the ankle, screen aligned, +x = inner (LEFT foot); sole at y ~ 29
FOOT_L = [
    ('cm', -4, -6, 0, 24),
    ('cm', 44, 6, 70, 10),
    ('cm', 50, 18, 95, 8),
    ('cm', 30, 29, 170, 14),
    ('cm', -14, 30, 180, 20),
    ('cm', -48, 25, 215, 10),
    ('cm', -56, 11, 265, 8),
    ('cm', -44, -2, 320, 10),
]
FOOT_TILT_DEG = 4             # toes tilt outward
FOOT_SHADING = dict(highlight=0.4, core=0.5)
# belly crease on the leg (torso's lower contour pushed 4px down), in LEFT-leg local space
BELLY_AO_L = [('cm', -49.5, -36, 90, 45), ('cm', 65, 46, 0, 63), ('cm', 100, 48, 0, 10)]   # the belly's round quadrant, pushed 4px down
BELLY_AO = dict(thickness=14, alpha=0.26, feather=14)
INNER_AO_L = [('cm', 63, 22, 100, 10), ('cm', 52, 50, 108, 12), ('cm', 43, 90, 100, 14)]
INNER_AO = dict(thickness=11, alpha=0.28, feather=7)

# ---------------------------------------------------------------- arms (origin: shoulder pivot, screen aligned; bones carry the angle)
ARM_PIVOT_DX_FRAC = 0.22      # cx +- 0.22 W
ARM_PIVOT_BELOW_YB = 1        # pivot 1px below the head's bottom line
ARM_ANGLES = (116.0, -30.0)   # LEFT arm: shoulder bone world angle (90 = straight down), elbow bone relative
UPPER_LEN, FORE_LEN, WRIST_LEN = 46, 36, 20
ARM_HALF = (26.5, 23.5, 20.0) # half thickness at shoulder / elbow / wrist
ARM_CAP_UP = 18               # how far the shoulder cap reaches up under the head
ARM_INNER_EXTRA = 2.5         # inner shoulder bulge into the torso
ARM_SHADING = dict(highlight=0.45, core=0.55)
SHOULDER_AO = dict(thickness=18, alpha=0.30, feather=10, push=8)
ARM_CAST = dict(L=dict(thickness=14, alpha=0.28, feather=10), R=dict(thickness=8, alpha=0.18, feather=6), offset=6)

# ---------------------------------------------------------------- hands (origin: wrist; +y along the forearm; +x = inner for the LEFT hand)
MITTEN_L = [
    ('cm', 0, -8, 0, 20),
    ('cm', 25, 5, 50, 8),
    ('cm', 36, 19, 90, 9),     # thumb nub merged into the silhouette
    ('cm', 30, 32, 125, 8),
    ('cm', 34, 45, 95, 10),
    ('cm', 0, 65, 180, 27),
    ('cm', -34, 43, -95, 16),
    ('cm', -26, 9, -50, 10),
]
MITTEN_CREASES_L = [[('cm', 20, 9, 70, 6), ('cm', 25, 26, 110, 6)]]
FIST_L = [
    ('cm', 0, -5, 0, 16),
    ('cm', 28, 18, 90, 14),
    ('cm', 0, 50, 180, 20),
    ('cm', -28, 20, -90, 14),
]
FIST_CREASES_L = [[('cm', 4, 10, 20, 8), ('cm', 22, 20, 110, 8), ('cm', 16, 34, 170, 6)]]
OPENPALM_L = [
    ('cm', 0, -5, 0, 14),
    ('cm', 25, 12, 70, 10),
    ('cm', 33, 28, 20, 6),
    ('cm', 46, 34, 80, 6),
    ('cm', 40, 44, 160, 5),
    ('cm', 29, 50, 100, 6),
    ('cm', 22, 66, 180, 5),
    ('cm', 14, 62, 180, 3),
    ('cm', 7, 67, 180, 4),
    ('cm', 0, 63, 180, 3),
    ('cm', -7, 67, 180, 4),
    ('cm', -14, 62, 180, 3),
    ('cm', -21, 65, 200, 5),
    ('cm', -29, 46, -95, 12),
    ('cm', -24, 10, -55, 10),
]
OPENPALM_CREASES_L = [[('cm', 14, 61, 90, 4), ('cm', 14, 50, 90, 4)],
                      [('cm', 0, 62, 90, 4), ('cm', 0, 50, 90, 4)],
                      [('cm', -14, 61, 90, 4), ('cm', -14, 50, 90, 4)],
                      [('cm', 30, 34, 140, 5), ('cm', 22, 44, 110, 5)]]
THUMBUP_L = [
    ('cm', 0, -5, 0, 16),
    ('cm', 29, 16, 85, 12),
    ('cm', 24, 40, 120, 8),
    ('cm', 21, 48, 90, 6),
    ('cm', 20, 68, 95, 8),
    ('cm', 9, 80, 180, 10),
    ('cm', -2, 68, -85, 8),
    ('cm', -3, 50, -95, 5),
    ('cm', -14, 46, 185, 8),
    ('cm', -28, 24, -95, 12),
    ('cm', -20, 2, -45, 8),
]
THUMBUP_CREASES_L = [[('cm', 4, 12, 15, 8), ('cm', 20, 24, 100, 8), ('cm', 12, 40, 175, 6)]]
HAND_SHADING = dict(highlight=0.5, core=0.45)
CREASE = dict(thickness=5, alpha=0.5, feather=3)
WRIST_CREASE_L = [('cm', -17, 1, 15, 9), ('cm', 0, 5, 0, 10), ('cm', 17, 1, -15, 9)]   # the arm's end shading the top of the hand
WRIST_CREASE = dict(thickness=10, alpha=0.24, feather=7)

CROTCH_AO = dict(thickness=20, alpha=0.30, feather=12)   # soft dark spot where the belly meets the legs

# ---------------------------------------------------------------- ground
FOOT_CONTACT = dict(half_len_out=36, half_len_in=34, thickness=9, alpha=0.30, feather=5, dy=2, dx_out=6)
GROUND_SHADOW = dict(half_len=118, thickness=10, alpha=0.22, feather=10, dy=4)

# ---------------------------------------------------------------- idle
IDLE = dict(frames=144, torso_sx=0.99, torso_sy=1.025, head_bob=3, arm_sway_deg=2)
