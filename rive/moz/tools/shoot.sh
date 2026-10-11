#!/bin/zsh
# Rebuild the scene, verify, render the idle frame + the black silhouette, and compose a comparison sheet.
# usage: tools/shoot.sh <tag>
set -e
export PATH="$HOME/.rive/bin:$PATH"
P="$(cd "$(dirname "$0")/.." && pwd)"
SCR=/private/tmp/claude-501/-Users-mahesh-Desktop-Projects-mcrudra-com-MOZY/37908326-1540-4000-b302-65cbf284ee99/scratchpad
TAG="${1:-shot}"
cd "$P"; mkdir -p build/shots
python3 -I tools/gen_body.py | tail -1
rive . --verify 2>&1 | tail -1
rive . --screenshot="build/shots/${TAG}.png" --advance=1 2>&1 | tail -1
python3 -I tools/gen_body.py --silhouette "$SCR/sil/scene.rml" | tail -1
(cd "$SCR/sil" && rive . --screenshot="build/sil.png" --advance=1 2>&1 | tail -1)
cp "$SCR/sil/build/sil.png" "build/shots/${TAG}_sil.png"
python3 -I "$SCR/compare.py" "build/shots/${TAG}.png" "build/shots/${TAG}_cmp.png" "build/shots/${TAG}_sil.png"
rive inspect . --summary 2>&1 | python3 -c "import sys,json; d=json.load(sys.stdin); a=d['artboards'][0]; print('problems:', d['problems']); print('objects:', a['objects'])"
