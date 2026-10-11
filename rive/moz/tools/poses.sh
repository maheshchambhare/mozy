#!/bin/zsh
# Fire each pose trigger through a click listener (test build only) and screenshot the held pose.
set -e
export PATH="$HOME/.rive/bin:$PATH"
P="$(cd "$(dirname "$0")/.." && pwd)"
SCR=/private/tmp/claude-501/-Users-mahesh-Desktop-Projects-mcrudra-com-MOZY/37908326-1540-4000-b302-65cbf284ee99/scratchpad
S="$SCR/stress"; mkdir -p "$S/build"; cd "$P"
python3 -I tools/gen_body.py --out "$S/scene.rml" --test-hits | tail -1
cd "$S"
rive . --verify 2>&1 | tail -1
i=0; files=()
for name in Cheer Stop Walk ArmsCrossed ThumbsUp; do
  x=$((60 + 120 * i)); i=$((i + 1))
  if [ "$name" = "Walk" ]; then
    for adv in 12 30 48; do rive . --screenshot="build/pose_${name}_$adv.png" --pointer=click@$x,30 --advance=$adv 2>&1 | tail -1; files+=("build/pose_${name}_$adv.png"); done
  else
    rive . --screenshot="build/pose_${name}.png" --pointer=click@$x,30 --advance=44 2>&1 | tail -1; files+=("build/pose_${name}.png")
  fi
done
# return-to-rest check: a click then 200 frames should match no click at 200 frames
rive . --screenshot="build/rest_after_cheer.png" --pointer=click@60,30 --advance=200 2>&1 | tail -1
rive . --screenshot="build/rest_plain.png" --advance=200 2>&1 | tail -1
python3 -I - "$P/build/shots/poses_sheet.png" "${files[@]}" <<'PY'
import sys
from PIL import Image, ImageChops
out = sys.argv[1]; ims = [Image.open(f).convert('RGB') for f in sys.argv[2:]]
w = sum(i.size[0] for i in ims) + 12 * (len(ims) + 1); h = max(i.size[1] for i in ims) + 24
sheet = Image.new('RGB', (w, h), (247, 244, 238)); x = 12
for i in ims: sheet.paste(i, (x, 12)); x += i.size[0] + 12
sheet.save(out); print('saved', out, sheet.size)
a = Image.open('build/rest_after_cheer.png').convert('RGB'); b = Image.open('build/rest_plain.png').convert('RGB')
print('rest-return diff bbox:', ImageChops.difference(a, b).getbbox())
PY
