"""Print the artboard hierarchy (Nodes, Shapes, Bones, Solos, constraints, animations) from rive inspect --json."""
import json, subprocess, sys, os
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = subprocess.run([os.path.expanduser('~/.rive/bin/rive'), 'inspect', P, '--json'], capture_output=True, text=True).stdout
d = json.loads(raw)
SHOW = {'Artboard', 'Node', 'Shape', 'RootBone', 'Bone', 'Solo', 'IKConstraint', 'ClippingShape', 'DrawRules', 'Skin'}
def walk(o, depth=0, out=None):
    if isinstance(o, dict):
        t = o.get('type', '')
        if t in SHOW and (t != 'Shape' or depth <= 9):
            name = o.get('name', '')
            extra = ''
            if t == 'IKConstraint': extra = ' -> target ' + str(o.get('targetId'))
            if t == 'ClippingShape': extra = ' (clip to ' + str(o.get('sourceId')) + ')'
            if t == 'Skin': extra = f" ({len([k for k in o.get('children', []) if k.get('type') == 'Tendon'])} tendons)"
            if t == 'Solo': extra = ' [Solo]'
            if t in ('RootBone', 'Bone'): extra = f" (bone, len {o.get('length')})"
            if name == 'Head': extra = '  (existing artwork, untouched; children omitted)'
            out.append('  ' * depth + f"{name or t}{extra}")
            if name == 'Head': return
        for k in o.get('children', []) or []:
            walk(k, depth + (1 if t in SHOW else 0), out)
    elif isinstance(o, list):
        for k in o: walk(k, depth, out)
out = []
walk(d['artboards'], 0, out)
skip = ('Crease', 'Wrist Shade', 'Frame')
for line in out:
    if any(sk in line for sk in skip): continue
    print(line)
def find(o, t, acc):
    if isinstance(o, dict):
        if o.get('type') == t: acc.append(o)
        for k in o.get('children', []) or []: find(k, t, acc)
    elif isinstance(o, list):
        for k in o: find(k, t, acc)
    return acc
A = d['artboards']
print('\nAnimations:', ', '.join(a.get('name', '?') for a in find(A, 'LinearAnimation', [])))
print('State machines:', ', '.join(a.get('name', '?') for a in find(A, 'StateMachine', [])))
print('Layers:', ', '.join(a.get('name', '?') for a in find(A, 'StateMachineLayer', [])))
print('Trigger inputs:', ', '.join(a.get('name', '?') for a in find(A, 'StateMachineTrigger', [])))
print('Bones:', len(find(A, 'Bone', [])) + len(find(A, 'RootBone', [])), ' Skins:', len(find(A, 'Skin', [])), ' IK:', len(find(A, 'IKConstraint', [])), ' Solos:', len(find(A, 'Solo', [])))
