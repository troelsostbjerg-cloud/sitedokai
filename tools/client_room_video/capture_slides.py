from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_DIR = Path(__file__).resolve().parent
SLIDES_DIR = BASE_DIR / "slides"
OUTPUT_DIR = BASE_DIR / "frames"
OUTPUT_DIR.mkdir(exist_ok=True)

SLIDES = [
    "scene_01.html",
    "scene_02.html",
    "scene_03.html",
    "scene_04.html",
    "scene_05.html",
]


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=2,
        )

        for index, filename in enumerate(SLIDES, start=1):
            html_path = SLIDES_DIR / filename
            out_path = OUTPUT_DIR / f"slide_{index:02d}.png"
            page.goto(html_path.resolve().as_uri(), wait_until="load")
            page.wait_for_timeout(1200)
            page.screenshot(path=str(out_path), type="png")
            print(f"Captured {out_path.name}")

        browser.close()


if __name__ == "__main__":
    main()
