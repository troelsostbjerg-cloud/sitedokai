# Contact sheet: python3 scripts/sheet.py out.png a.png b.png ...
import sys
from PIL import Image
out, files = sys.argv[1], sys.argv[2:]
ims = [Image.open(f).convert("RGB") for f in files]
w0, h0 = ims[0].size
tw = 480 if h0 > w0 else 960
th = int(h0 * tw / w0)
cols = 6 if h0 > w0 else (2 if len(ims) <= 4 else 3)
cols = min(cols, len(ims))
rows = (len(ims) + cols - 1) // cols
S = Image.new("RGB", (tw * cols + 10 * (cols - 1), th * rows + 10 * (rows - 1)), "red")
for i, im in enumerate(ims):
    S.paste(im.resize((tw, th)), ((i % cols) * (tw + 10), (i // cols) * (th + 10)))
S.save(out)
