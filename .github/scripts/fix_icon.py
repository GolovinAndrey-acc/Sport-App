"""Приводит icon.png в порядок для иконки приложения:
- заливает прозрачные места белым (иначе iPhone и Mac рисуют их чёрными);
- убирает тёмные рамки и фон вокруг плашки — всё, что примыкает к краям картинки, становится белым;
- обрезает пустые белые поля, рисунок становится крупнее;
- ставит рисунок по центру с отступом и делает ровно 1024×1024 на полностью белом фоне.
Углы скругляют сами iPhone и Mac. Уже обработанный файл повторно не трогается."""
import sys
from PIL import Image, ImageChops, ImageDraw
from PIL.PngImagePlugin import PngInfo

BG = (255, 255, 255)   # цвет фона
MARGIN = 0.10          # отступ от края с каждой стороны (10%) — как у иконки со щитом
SIZE = 1024
MARK = "processed-v2"
PATH = sys.argv[1] if len(sys.argv) > 1 else "icon.png"


def near(a, b, tol=40):
    return all(abs(x - y) <= tol for x, y in zip(a, b))


def trim(im):
    mask = ImageChops.difference(im, Image.new("RGB", im.size, BG)).convert("L").point(lambda v: 255 if v > 18 else 0)
    box = mask.getbbox()
    return im.crop(box) if box else im


im = Image.open(PATH)
if im.info.get("sport-icon") == MARK:
    print("Иконка уже обработана — пропускаю")
    sys.exit(0)

# 1. Прозрачность → белый
im = im.convert("RGBA")
base = Image.new("RGBA", im.size, BG + (255,))
base.alpha_composite(im)
im = base.convert("RGB")

# 2. Снимаем рамки слоями: если все четыре угла одного «не белого» цвета (чёрный фон,
#    тёмная рамка, уголки вокруг скруглённой плашки) — это фон, заливаем его белым от краёв
for _ in range(4):
    im = trim(im)
    w, h = im.size
    corners = [im.getpixel(p) for p in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]]
    if near(corners[0], BG, 12) or not all(near(c, corners[0], 30) for c in corners):
        break
    for p in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(im, p, BG, thresh=40)
im = trim(im)

# 3. Квадрат с отступом, рисунок по центру
w, h = im.size
side = int(round(max(w, h) / (1 - 2 * MARGIN)))
canvas = Image.new("RGB", (side, side), BG)
canvas.paste(im, ((side - w) // 2, (side - h) // 2))

# 4. Итоговый размер — максимально чётко
out = canvas.resize((SIZE, SIZE), Image.LANCZOS)
info = PngInfo()
info.add_text("sport-icon", MARK)
out.save(PATH, "PNG", pnginfo=info, optimize=True)
print(f"Готово: {PATH} → {SIZE}×{SIZE}, белый фон, рамки убраны, поля обрезаны")
