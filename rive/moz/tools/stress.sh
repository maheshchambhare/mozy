#!/bin/zsh
# Joint stress test: build posed variants (static bone rotations, idle keys off) and render each.
# usage: tools/stress.sh  -> build/shots/stress_sheet.png
set -e
export PATH="$HOME/.rive/bin:$PATH"
P="$(cd "$(dirname "$0")/.." && pwd)"
SCR=/private/tmp/claude-501/-Users-mahesh-Desktop-Projects-mcrudra-com-MOZY/37908326-1540-4000-b302-65cbf284ee99/scratchpad
S="$SCR/stress"; mkdir -p "$S/build"; cd "$P"
# name|pose string   (shoulder_* absolute world degrees: left rest 116, right rest 64; 90 = straight down)
typeset -a CASES
CASES=(
 "arms_m30|shoulder_L=86,shoulder_R=94,elbow_L=0,elbow_R=0,hip_L=120,hip_R=60,ik=0"
 "arms_p60_legs_m30|shoulder_L=176,shoulder_R=4,elbow_L=-40,elbow_R=40,hip_L=60,hip_R=120,ik=0"
 "arms_p150_elbow90|shoulder_L=266,shoulder_R=-86,elbow_L=-90,elbow_R=90,hand_L=Fist,hand_R=OpenPalm,knee_L=30,knee_R=-30,ik=0"
 "arms_out90_hands|shoulder_L=206,shoulder_R=-26,elbow_L=-110,elbow_R=110,hand_L=ThumbUp,hand_R=Fist,ik=1"
)
files=()
for c in $CASES; do
  name="${c%%|*}"; pose="${c#*|}"
  python3 -I tools/gen_body.py --out "$S/scene.rml" --no-idle --pose "$pose" | tail -1
  (cd "$S" && rive . --screenshot="build/$name.png" --advance=1 2>&1 | tail -1)
  files+=("$S/build/$name.png")
done
python3 -I - "$P/build/shots/stress_sheet.png" "${files[@]}" <<'PY'
import sys
from PIL import Image
out = sys.argv[1]; ims = [Image.open(f).convert('RGB') for f in sys.argv[2:]]
w = sum(i.size[0] for i in ims) + 16 * (len(ims) + 1); h = max(i.size[1] for i in ims) + 32
sheet = Image.new('RGB', (w, h), (247, 244, 238)); x = 16
for i in ims: sheet.paste(i, (x, 16)); x += i.size[0] + 16
sheet.save(out); print('saved', out, sheet.size)
PY
