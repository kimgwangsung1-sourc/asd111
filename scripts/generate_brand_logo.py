from __future__ import annotations

import os
import struct
import zlib
from pathlib import Path


LOGO_WIDTH = 1000
LOGO_HEIGHT = 200
OG_WIDTH = 1200
OG_HEIGHT = 630

TRANSPARENT = (0, 0, 0, 0)
PANEL = (7, 18, 16, 255)
PANEL_SOFT = (11, 32, 28, 255)
PANEL_GLOW = (0, 245, 196, 36)
SLIME = (0, 245, 196, 255)
SLIME_DARK = (0, 168, 107, 255)
SLIME_HIGHLIGHT = (220, 255, 246, 96)
INK = (8, 17, 15, 255)
TEXT_DARK = (10, 20, 18, 255)
TEXT_LIGHT = (236, 255, 251, 255)
TEXT_SOFT = (188, 221, 214, 160)
ACCENT = (0, 245, 196, 255)
ACCENT_DARK = (0, 168, 107, 255)

FONT = {
    "N": [
        "10001",
        "11001",
        "10101",
        "10011",
        "10001",
        "10001",
        "10001",
    ],
    "E": [
        "11111",
        "10000",
        "11110",
        "10000",
        "10000",
        "10000",
        "11111",
    ],
    "O": [
        "01110",
        "10001",
        "10001",
        "10001",
        "10001",
        "10001",
        "01110",
    ],
    "C": [
        "01111",
        "10000",
        "10000",
        "10000",
        "10000",
        "10000",
        "01111",
    ],
    "P": [
        "11110",
        "10001",
        "10001",
        "11110",
        "10000",
        "10000",
        "10000",
    ],
    "S": [
        "01111",
        "10000",
        "10000",
        "01110",
        "00001",
        "00001",
        "11110",
    ],
    "T": [
        "11111",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
        "00100",
    ],
}


class Canvas:
    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.pixels = bytearray(width * height * 4)

    def blend_pixel(self, x: int, y: int, color: tuple[int, int, int, int]) -> None:
        if x < 0 or y < 0 or x >= self.width or y >= self.height:
            return
        r, g, b, a = color
        if a <= 0:
            return
        idx = (y * self.width + x) * 4
        dr, dg, db, da = self.pixels[idx:idx + 4]
        src_a = a / 255.0
        dst_a = da / 255.0
        out_a = src_a + dst_a * (1.0 - src_a)
        if out_a <= 0:
            return
        self.pixels[idx] = int((r * src_a + dr * dst_a * (1.0 - src_a)) / out_a)
        self.pixels[idx + 1] = int((g * src_a + dg * dst_a * (1.0 - src_a)) / out_a)
        self.pixels[idx + 2] = int((b * src_a + db * dst_a * (1.0 - src_a)) / out_a)
        self.pixels[idx + 3] = int(out_a * 255)

    def fill_rect(self, x: int, y: int, w: int, h: int, color: tuple[int, int, int, int]) -> None:
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.blend_pixel(xx, yy, color)

    def fill_round_rect(self, x: int, y: int, w: int, h: int, r: int, color: tuple[int, int, int, int]) -> None:
        rr = r * r
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                cx = min(max(xx, x + r), x + w - r - 1)
                cy = min(max(yy, y + r), y + h - r - 1)
                dx = xx - cx
                dy = yy - cy
                if dx * dx + dy * dy <= rr:
                    self.blend_pixel(xx, yy, color)

    def fill_ellipse(
        self,
        cx: float,
        cy: float,
        rx: float,
        ry: float,
        color: tuple[int, int, int, int],
    ) -> None:
        min_x = max(0, int(cx - rx - 1))
        max_x = min(self.width - 1, int(cx + rx + 1))
        min_y = max(0, int(cy - ry - 1))
        max_y = min(self.height - 1, int(cy + ry + 1))
        for yy in range(min_y, max_y + 1):
            for xx in range(min_x, max_x + 1):
                dx = (xx - cx) / rx
                dy = (yy - cy) / ry
                if dx * dx + dy * dy <= 1.0:
                    self.blend_pixel(xx, yy, color)

    def stroke_segment(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        thickness: float,
        color: tuple[int, int, int, int],
    ) -> None:
        min_x = max(0, int(min(x1, x2) - thickness - 1))
        max_x = min(self.width - 1, int(max(x1, x2) + thickness + 1))
        min_y = max(0, int(min(y1, y2) - thickness - 1))
        max_y = min(self.height - 1, int(max(y1, y2) + thickness + 1))
        vx = x2 - x1
        vy = y2 - y1
        v_len_sq = vx * vx + vy * vy
        if v_len_sq == 0:
            self.fill_ellipse(x1, y1, thickness / 2, thickness / 2, color)
            return
        radius_sq = (thickness / 2) ** 2
        for yy in range(min_y, max_y + 1):
            for xx in range(min_x, max_x + 1):
                wx = xx - x1
                wy = yy - y1
                t = max(0.0, min(1.0, (wx * vx + wy * vy) / v_len_sq))
                px = x1 + t * vx
                py = y1 + t * vy
                dx = xx - px
                dy = yy - py
                if dx * dx + dy * dy <= radius_sq:
                    self.blend_pixel(xx, yy, color)


def add_soft_glow(canvas: Canvas, x: int, y: int, w: int, h: int, r: int, spread: int) -> None:
    for step in range(spread, 0, -1):
        alpha = max(6, int(PANEL_GLOW[3] * step / spread))
        canvas.fill_round_rect(
            x - step,
            y - step,
            w + step * 2,
            h + step * 2,
            r + step,
            (PANEL_GLOW[0], PANEL_GLOW[1], PANEL_GLOW[2], alpha),
        )


def text_width(text: str, cell: int, gap: int) -> int:
    width = 0
    for char in text:
        if char == " ":
            width += 3 * cell + gap
            continue
        pattern = FONT[char]
        width += len(pattern[0]) * cell + gap
    return max(0, width - gap)


def draw_text(canvas: Canvas, text: str, x: int, y: int, cell: int, gap: int, color: tuple[int, int, int, int]) -> None:
    cursor = x
    for char in text:
        if char == " ":
            cursor += 3 * cell + gap
            continue
        pattern = FONT[char]
        for row_idx, row in enumerate(pattern):
            for col_idx, bit in enumerate(row):
                if bit != "1":
                    continue
                canvas.fill_round_rect(
                    cursor + col_idx * cell,
                    y + row_idx * cell,
                    cell - 2,
                    cell - 2,
                    max(2, cell // 4),
                    color,
                )
        cursor += len(pattern[0]) * cell + gap


def draw_brand_icon(canvas: Canvas, x: int, y: int, size: int, transparent: bool = False) -> None:
    panel_radius = max(22, size // 4)
    if not transparent:
        add_soft_glow(canvas, x, y, size, size, panel_radius, max(6, size // 20))
        canvas.fill_round_rect(x, y, size, size, panel_radius, PANEL)
        canvas.fill_round_rect(x + size // 10, y + size // 10, size - size // 5, size - size // 5, panel_radius - 10, PANEL_SOFT)

    slime_cx = x + size * 0.46
    slime_cy = y + size * 0.53
    canvas.stroke_segment(
        x + size * 0.52,
        y + size * 0.28,
        x + size * 0.74,
        y + size * 0.10,
        size * 0.10,
        SLIME_DARK,
    )
    canvas.stroke_segment(
        x + size * 0.70,
        y + size * 0.10,
        x + size * 0.82,
        y + size * 0.10,
        size * 0.08,
        SLIME_DARK,
    )
    canvas.stroke_segment(
        x + size * 0.82,
        y + size * 0.10,
        x + size * 0.82,
        y + size * 0.30,
        size * 0.08,
        SLIME_DARK,
    )

    canvas.fill_ellipse(slime_cx, slime_cy, size * 0.28, size * 0.22, SLIME)
    canvas.fill_ellipse(slime_cx, y + size * 0.66, size * 0.34, size * 0.18, SLIME)
    canvas.fill_ellipse(x + size * 0.32, y + size * 0.42, size * 0.10, size * 0.12, SLIME_HIGHLIGHT)
    canvas.fill_ellipse(x + size * 0.38, y + size * 0.51, size * 0.04, size * 0.05, INK)
    canvas.fill_ellipse(x + size * 0.56, y + size * 0.51, size * 0.04, size * 0.05, INK)
    canvas.stroke_segment(
        x + size * 0.37,
        y + size * 0.68,
        x + size * 0.50,
        y + size * 0.73,
        size * 0.04,
        INK,
    )
    canvas.stroke_segment(
        x + size * 0.50,
        y + size * 0.73,
        x + size * 0.63,
        y + size * 0.68,
        size * 0.04,
        INK,
    )


def draw_logo(canvas: Canvas) -> None:
    draw_brand_icon(canvas, 24, 20, 160, transparent=False)
    draw_text(canvas, "NEONCPS", 225, 46, 13, 11, TEXT_DARK)
    canvas.fill_round_rect(225, 156, 268, 10, 5, ACCENT)
    canvas.fill_round_rect(512, 156, 126, 10, 5, ACCENT_DARK)


def draw_og_image(canvas: Canvas) -> None:
    for y in range(canvas.height):
        tint = int(12 + (y / max(1, canvas.height - 1)) * 18)
        canvas.fill_rect(0, y, canvas.width, 1, (4, 12 + tint, 15 + tint, 255))

    add_soft_glow(canvas, 120, 84, 960, 462, 52, 28)
    canvas.fill_round_rect(120, 84, 960, 462, 52, PANEL)
    canvas.fill_round_rect(150, 115, 900, 400, 42, PANEL_SOFT)

    draw_brand_icon(canvas, 150, 145, 220, transparent=False)

    draw_text(canvas, "NEONCPS", 340, 202, 16, 11, TEXT_LIGHT)
    draw_text(canvas, "CPS", 340, 352, 13, 10, ACCENT)
    draw_text(canvas, "TEST", 487, 352, 13, 10, TEXT_SOFT)
    canvas.fill_round_rect(340, 430, 540, 12, 6, ACCENT)
    canvas.fill_round_rect(340, 462, 350, 12, 6, ACCENT_DARK)


def write_png(path: Path, canvas: Canvas) -> None:
    def chunk(chunk_type: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + chunk_type
            + data
            + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xFFFFFFFF)
        )

    raw = bytearray()
    stride = canvas.width * 4
    for y in range(canvas.height):
        raw.append(0)
        start = y * stride
        raw.extend(canvas.pixels[start:start + stride])

    png = bytearray(b"\x89PNG\r\n\x1a\n")
    png.extend(chunk(b"IHDR", struct.pack(">IIBBBBB", canvas.width, canvas.height, 8, 6, 0, 0, 0)))
    png.extend(chunk(b"IDAT", zlib.compress(bytes(raw), 9)))
    png.extend(chunk(b"IEND", b""))
    path.write_bytes(png)


def main() -> None:
    root = Path(__file__).resolve().parents[1]

    logo_canvas = Canvas(LOGO_WIDTH, LOGO_HEIGHT)
    draw_logo(logo_canvas)

    logo_asset_path = root / "assets" / "brand" / "neoncps-logo-upload.png"
    logo_asset_path.parent.mkdir(parents=True, exist_ok=True)
    write_png(logo_asset_path, logo_canvas)
    write_png(root / "neoncps-logo-upload.png", logo_canvas)

    og_canvas = Canvas(OG_WIDTH, OG_HEIGHT)
    draw_og_image(og_canvas)
    write_png(root / "og-image.png", og_canvas)

    logo_size_kb = os.path.getsize(logo_asset_path) / 1024
    og_size_kb = os.path.getsize(root / "og-image.png") / 1024
    print(f"created {logo_asset_path} ({LOGO_WIDTH}x{LOGO_HEIGHT}, {logo_size_kb:.1f} KB)")
    print(f"created {root / 'og-image.png'} ({OG_WIDTH}x{OG_HEIGHT}, {og_size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
