#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph image for CyberChef (gchq.github.io/CyberChef).

Pillow-only. Composes the official CyberChef banner lockup (src/web/static/images/logo/
cyberchef_banner_1500.png) on a white 1200x630 canvas and adds the site's real meta
description ("The Cyber Swiss Army Knife - a web app for encryption, encoding,
compression and data analysis") in the brand's dark grey.

Usage:
    python3 make-og-image.py [out.png] [--banner PATH] [--font-dir DIR]
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = "#ffffff"
INK = "#3c3c3c"       # CyberChef wordmark grey (matches banner text)
MUTED = "#6b6b6b"     # secondary grey for the tagline

BANNER_W, BANNER_H = 1500, 516


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def load_font(size, bold=False):
    fdir = None
    if "--font-dir" in sys.argv:
        fdir = sys.argv[sys.argv.index("--font-dir") + 1]
    if not fdir:
        fdir = os.environ.get("FONT_DIR", "/usr/share/fonts/truetype")
    cands = ([f"{fdir}/lato/Lato-Bold.ttf", f"{fdir}/dejavu/DejaVuSans-Bold.ttf"] if bold
             else [f"{fdir}/lato/Lato-Regular.ttf", f"{fdir}/dejavu/DejaVuSans.ttf",
                   f"{fdir}/liberation/LiberationSans-Regular.ttf"])
    for c in cands:
        if os.path.exists(c):
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def main():
    out = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else "cyberchef_og.png"
    banner_path = None
    if "--banner" in sys.argv:
        banner_path = sys.argv[sys.argv.index("--banner") + 1]
    if not banner_path:
        banner_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                   "cyberchef_banner_1500.png")
    if not os.path.exists(banner_path):
        raise SystemExit(f"banner not found: {banner_path}")

    img = Image.new("RGB", (W, H), hex_rgb(BG))
    draw = ImageDraw.Draw(img)

    # Official banner lockup, scaled to full width, centered above the tagline.
    banner = Image.open(banner_path).convert("RGBA")
    scale = W / banner.width
    bw, bh = W, int(round(banner.height * scale))
    banner = banner.resize((bw, bh), Image.LANCZOS)

    # Layout: banner occupies the top ~62%, tagline bottom ~12%, breathing room between.
    tag_w, tag_h = 690, 42
    banner_top = (H - bh) // 2 - 30
    img.paste(banner, (0, banner_top), banner)

    tag_bbox = draw.textbbox((0, 0), "The Cyber Swiss Army Knife - a web app for encryption, encoding, compression and data analysis", font=load_font(30))
    tag_width = tag_bbox[2] - tag_bbox[0]

    # Fit the tagline on one line; shrink if the full description is too wide.
    text = "The Cyber Swiss Army Knife - a web app for encryption, encoding, compression and data analysis"
    fsize = 30
    while tag_width > W - 120 and fsize > 18:
        fsize -= 1
        tag_bbox = draw.textbbox((0, 0), text, font=load_font(fsize))
        tag_width = tag_bbox[2] - tag_bbox[0]

    font = load_font(fsize)
    tag_bbox = draw.textbbox((0, 0), text, font=font)
    tag_width = tag_bbox[2] - tag_bbox[0]
    tag_x = (W - tag_width) // 2
    tag_y = banner_top + bh + 26
    draw.text((tag_x, tag_y), text, font=font, fill=hex_rgb(MUTED))

    img.save(out, "PNG")
    print(f"saved {out} ({img.size[0]}x{img.size[1]})")


if __name__ == "__main__":
    main()