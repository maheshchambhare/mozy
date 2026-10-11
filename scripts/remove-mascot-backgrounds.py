"""Remove only edge-connected neutral white matte; keep enclosed eye highlights.
User authorized deterministic local background removal. Original HD files stay intact.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
source = Path('public/assets/mascots-hd')
target = Path('public/assets/mascots-cutout')
target.mkdir(exist_ok=True)
for path in sorted(source.glob('*.webp')):
    image = Image.open(path).convert('RGB')
    rgb = np.asarray(image).astype(np.float32)
    # Warm cream skin and saturated props are not neutral-white background.
    candidate = (rgb.min(axis=2) > 205) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 22)
    seed = np.zeros(candidate.shape, dtype=bool)
    seed[0, :] = candidate[0, :]; seed[-1, :] = candidate[-1, :]
    seed[:, 0] = candidate[:, 0]; seed[:, -1] = candidate[:, -1]
    exterior = ndimage.binary_propagation(seed, mask=candidate)
    alpha = np.asarray(Image.fromarray((~exterior * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(.45))).copy()
    # Set distant exterior to exactly zero, leaving a subpixel antialiased boundary.
    alpha[ndimage.binary_erosion(exterior)] = 0
    output = image.convert('RGBA'); output.putalpha(Image.fromarray(alpha))
    output.save(target / path.name, 'WEBP', quality=94, method=6, exact=True)
    print(path.name, 'transparent pixels:', int((alpha == 0).sum()))
