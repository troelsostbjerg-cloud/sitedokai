from __future__ import annotations

import math
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent
FRAME_DIR = ROOT / "frames"
OUT_MP4 = ROOT / "sitedokailab-launch-video.mp4"
POSTER = ROOT / "sitedokailab-launch-poster.png"

FPS = 30
W, H = 1920, 1080
CONTENT_W, CONTENT_H = 1560, 975
TOPBAR_H = 58
BROWSER_W, BROWSER_H = CONTENT_W, CONTENT_H + TOPBAR_H
SHOT_SCALE = CONTENT_W / 1440

BRAND = (27, 36, 29)
ACCENT = (86, 126, 103)
CANVAS = (241, 236, 227)
CANVAS_DARK = (224, 217, 205)
BAR = (24, 29, 24)


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


FONT_UI = "/System/Library/Fonts/HelveticaNeue.ttc"
FONT_DISPLAY = "/System/Library/Fonts/Avenir.ttc"
UI_14 = font(FONT_UI, 14)
UI_16 = font(FONT_UI, 16)
UI_18 = font(FONT_UI, 18)
UI_24 = font(FONT_UI, 24)
DISPLAY_52 = font(FONT_DISPLAY, 52)
DISPLAY_78 = font(FONT_DISPLAY, 78)


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


_BG_CACHE: Image.Image | None = None


def gradient_background() -> Image.Image:
    global _BG_CACHE
    if _BG_CACHE is not None:
        return _BG_CACHE.copy()

    img = Image.new("RGB", (W, H), CANVAS)
    draw_base = ImageDraw.Draw(img)
    for y in range(H):
        t = y / (H - 1)
        r = int(lerp(244, 225, t))
        g = int(lerp(240, 232, t))
        b = int(lerp(232, 219, t))
        draw_base.line((0, y, W, y), fill=(r, g, b))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.polygon(
        [(-120, 900), (520, 800), (1080, 910), (2040, 760), (2040, 1120), (-120, 1120)],
        fill=(91, 126, 104, 30),
    )
    draw.polygon(
        [(-80, 1050), (640, 940), (1300, 1030), (2040, 890), (2040, 1140), (-80, 1140)],
        fill=(27, 36, 29, 18),
    )
    _BG_CACHE = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGBA")
    return _BG_CACHE.copy()


def browser_group(shot: Image.Image, route: str, title: str) -> Image.Image:
    group = Image.new("RGBA", (BROWSER_W, BROWSER_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(group)

    draw.rounded_rectangle((0, 0, BROWSER_W, BROWSER_H), radius=28, fill=(250, 247, 241))
    shot = shot.resize((CONTENT_W, CONTENT_H), Image.Resampling.LANCZOS)
    group.paste(shot.convert("RGBA"), (0, TOPBAR_H))
    draw.rounded_rectangle((0, 0, BROWSER_W, TOPBAR_H + 18), radius=28, fill=BAR)
    draw.rectangle((0, 35, BROWSER_W, TOPBAR_H + 18), fill=BAR)

    for i, color in enumerate(((238, 95, 87), (242, 190, 76), (87, 177, 97))):
        draw.ellipse((28 + i * 24, 22, 42 + i * 24, 36), fill=color)

    draw.rounded_rectangle((132, 13, 420, 45), radius=14, fill=(38, 45, 38))
    draw.text((154, 22), title, font=UI_14, fill=(226, 222, 211))
    draw.rounded_rectangle((520, 13, 1130, 45), radius=14, fill=(232, 227, 217))
    draw.text((548, 22), f"127.0.0.1:4322{route}", font=UI_14, fill=(67, 75, 67))
    draw.text((1360, 22), "SiteDokAILab", font=UI_14, fill=(196, 205, 194))

    mask = rounded_mask((BROWSER_W, BROWSER_H), 28)
    clipped = Image.new("RGBA", (BROWSER_W, BROWSER_H), (0, 0, 0, 0))
    clipped.paste(group, (0, 0), mask)
    return clipped


def paste_browser(frame: Image.Image, group: Image.Image, scale: float) -> tuple[int, int, float]:
    shadow = Image.new("RGBA", (BROWSER_W + 120, BROWSER_H + 120), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((60, 60, BROWSER_W + 60, BROWSER_H + 60), radius=32, fill=(20, 22, 18, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(32))

    sw, sh = int((BROWSER_W + 120) * scale), int((BROWSER_H + 120) * scale)
    shadow = shadow.resize((sw, sh), Image.Resampling.LANCZOS)
    sx = (W - sw) // 2
    sy = (H - sh) // 2 + 5
    frame.alpha_composite(shadow, (sx, sy))

    bw, bh = int(BROWSER_W * scale), int(BROWSER_H * scale)
    scaled = group.resize((bw, bh), Image.Resampling.LANCZOS)
    bx = (W - bw) // 2
    by = (H - bh) // 2
    frame.alpha_composite(scaled, (bx, by))
    return bx, by, scale


def screenshot_to_frame(point: tuple[float, float], browser_origin: tuple[int, int, float]) -> tuple[float, float]:
    bx, by, scale = browser_origin
    x, y = point
    return (
        bx + x * SHOT_SCALE * scale,
        by + (TOPBAR_H + y * SHOT_SCALE) * scale,
    )


def point_at(points: list[tuple[float, float, float]], p: float) -> tuple[float, float]:
    if p <= points[0][0]:
        return points[0][1], points[0][2]
    for index in range(1, len(points)):
        prev = points[index - 1]
        curr = points[index]
        if p <= curr[0]:
            local = ease((p - prev[0]) / max(curr[0] - prev[0], 0.001))
            return lerp(prev[1], curr[1], local), lerp(prev[2], curr[2], local)
    return points[-1][1], points[-1][2]


def draw_click(draw: ImageDraw.ImageDraw, x: float, y: float, progress: float) -> None:
    radius = 16 + 62 * progress
    alpha = int(180 * (1 - progress))
    draw.ellipse(
        (x - radius, y - radius, x + radius, y + radius),
        outline=(86, 126, 103, alpha),
        width=5,
    )
    inner = 8 + 12 * progress
    draw.ellipse((x - inner, y - inner, x + inner, y + inner), fill=(86, 126, 103, int(alpha * 0.35)))


def draw_cursor(frame: Image.Image, x: float, y: float) -> None:
    cursor = Image.new("RGBA", (64, 74), (0, 0, 0, 0))
    d = ImageDraw.Draw(cursor)
    points = [(10, 8), (10, 55), (23, 43), (33, 65), (44, 60), (34, 39), (52, 39)]
    d.polygon([(px + 3, py + 4) for px, py in points], fill=(0, 0, 0, 85))
    d.polygon(points, fill=(255, 255, 250, 255), outline=(29, 36, 30, 255))
    frame.alpha_composite(cursor, (int(x), int(y)))


@dataclass(frozen=True)
class Scene:
    image: str
    route: str
    title: str
    duration: float
    cursor: list[tuple[float, float, float]]
    clicks: list[tuple[float, float, float]]
    final: bool = False


SCENES = [
    Scene(
        "capture-hire-top.png",
        "/hire",
        "Hire Troels - SiteDokAILab",
        3.0,
        [(0.0, 1120, 680), (0.58, 850, 120), (1.0, 825, 38)],
        [],
    ),
    Scene(
        "capture-hire-contact.png",
        "/hire",
        "Contact Troels",
        3.3,
        [(0.0, 760, 350), (0.40, 730, 340), (0.72, 1165, 660), (1.0, 1165, 660)],
        [(0.74, 1165, 660)],
    ),
    Scene(
        "capture-submit.png",
        "/submit",
        "Submit a workflow",
        3.3,
        [(0.0, 1180, 115), (0.46, 1000, 590), (0.78, 612, 38), (1.0, 612, 38)],
        [(0.80, 612, 38)],
    ),
    Scene(
        "capture-cases.png",
        "/cases",
        "Case library",
        3.2,
        [(0.0, 610, 38), (0.38, 494, 666), (0.66, 1040, 760), (0.88, 168, 30), (1.0, 168, 30)],
        [(0.88, 168, 30)],
    ),
    Scene(
        "capture-home.png",
        "/",
        "SiteDokAILab",
        4.2,
        [(0.0, 170, 30), (0.38, 190, 770), (0.78, 190, 770), (1.0, 1140, 550)],
        [(0.42, 190, 770)],
        final=True,
    ),
]


def draw_end_card(frame: Image.Image, alpha: float) -> None:
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    a = int(218 * alpha)
    draw.rounded_rectangle((520, 315, 1400, 730), radius=36, fill=(241, 236, 227, a))
    draw.rounded_rectangle((520, 315, 1400, 730), radius=36, outline=(86, 126, 103, int(120 * alpha)), width=2)
    draw.text((620, 415), "SiteDokAILab", font=DISPLAY_78, fill=(27, 36, 29, int(255 * alpha)))
    draw.text(
        (626, 525),
        "Free workflow reviews. Practical AI proof of work.",
        font=UI_24,
        fill=(56, 66, 56, int(235 * alpha)),
    )
    draw.rounded_rectangle((626, 590, 1045, 646), radius=20, fill=(86, 126, 103, int(245 * alpha)))
    draw.text((654, 608), "troelsostbjerg@gmail.com", font=UI_18, fill=(255, 252, 246, int(255 * alpha)))
    frame.alpha_composite(overlay)


def render() -> None:
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    FRAME_DIR.mkdir(parents=True)

    shots = {scene.image: Image.open(ROOT / scene.image).convert("RGB") for scene in SCENES}
    groups = {scene.image: browser_group(shots[scene.image], scene.route, scene.title) for scene in SCENES}

    total_frames = 0
    previous_group = None
    previous_scene = None
    transition = int(FPS * 0.42)

    for scene_index, scene in enumerate(SCENES):
        scene_frames = int(scene.duration * FPS)
        for f in range(scene_frames):
            p = f / max(scene_frames - 1, 1)
            frame = gradient_background()

            scale = 0.972 + 0.018 * ease(p)
            group = groups[scene.image]
            if scene_index > 0 and f < transition and previous_group is not None:
                old_frame = gradient_background()
                old_origin = paste_browser(old_frame, previous_group, 0.99)
                new_frame = gradient_background()
                new_origin = paste_browser(new_frame, group, scale)
                blend = ease(f / transition)
                frame = Image.blend(old_frame.convert("RGBA"), new_frame.convert("RGBA"), blend)
                origin = new_origin if blend > 0.5 else old_origin
            else:
                origin = paste_browser(frame, group, scale)

            cursor_point = point_at(scene.cursor, p)
            cx, cy = screenshot_to_frame(cursor_point, origin)
            click_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            click_draw = ImageDraw.Draw(click_layer)
            for click_p, click_x, click_y in scene.clicks:
                if click_p <= p <= click_p + 0.36:
                    px, py = screenshot_to_frame((click_x, click_y), origin)
                    draw_click(click_draw, px + 12, py + 18, (p - click_p) / 0.36)
            frame.alpha_composite(click_layer)
            draw_cursor(frame, cx, cy)

            if scene.final and p > 0.63:
                draw_end_card(frame, ease((p - 0.63) / 0.28))

            frame_path = FRAME_DIR / f"frame_{total_frames:04d}.jpg"
            frame.convert("RGB").save(frame_path, quality=93, optimize=True)
            if total_frames == int((sum(s.duration for s in SCENES) * FPS) - 1):
                frame.convert("RGB").save(POSTER, quality=95)
            total_frames += 1

        previous_group = groups[scene.image]
        previous_scene = scene

    if not POSTER.exists():
        Image.open(FRAME_DIR / f"frame_{total_frames - 1:04d}.jpg").save(POSTER)


def encode() -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            str(FRAME_DIR / "frame_%04d.jpg"),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-profile:v",
            "high",
            "-crf",
            "17",
            "-preset",
            "medium",
            "-movflags",
            "+faststart",
            str(OUT_MP4),
        ],
        check=True,
    )


if __name__ == "__main__":
    render()
    encode()
    print(OUT_MP4)
