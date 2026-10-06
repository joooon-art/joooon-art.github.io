import os
from PIL import Image

assets_dir = r"part2-landing-page\assets"
scratch_dir = r"part2-landing-page\assets\scratch_slices"
os.makedirs(scratch_dir, exist_ok=True)

# For each detail image, let's report its size and create small thumbnail or slices to inspect
for i in range(1, 11):
    fn = f"product1-detail-content{i}.png"
    p = os.path.join(assets_dir, fn)
    if not os.path.exists(p):
        continue
    img = Image.open(p)
    w, h = img.size
    print(f"=== {fn}: {w}x{h} ===")
    
    # Save slices of height ~800
    slice_h = 800
    for idx, y in enumerate(range(0, h, slice_h)):
        box = (0, y, w, min(y + slice_h, h))
        cropped = img.crop(box)
        slice_name = f"slice_{i}_{idx+1}_{y}_{min(y+slice_h, h)}.jpg"
        cropped.convert("RGB").save(os.path.join(scratch_dir, slice_name), quality=80)
        print(f"  Slice {idx+1}: y={y}..{min(y+slice_h, h)} -> {slice_name}")

print("All slices saved!")
