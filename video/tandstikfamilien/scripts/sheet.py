import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert("RGB").resize((960, 540)) for f in files]
cols = 2 if len(ims) <= 4 else 3
rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (960 * cols + 10 * (cols - 1), 540 * rows + 10 * (rows - 1)), "red")
for i, im in enumerate(ims):
    S.paste(im, ((i % cols) * 970, (i // cols) * 550))
S.save(out)
