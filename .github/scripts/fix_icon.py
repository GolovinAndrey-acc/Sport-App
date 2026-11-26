"""Приводит icon.png в порядок для иконки приложения:
- заливает прозрачные места белым (иначе iPhone и Mac рисуют их чёрными);
- убирает тёмные рамки и фон вокруг плашки — всё, что примыкает к краям картинки, становится белым;
- обрезает пустые белые поля, рисунок становится крупнее;
- ставит рисунок по центру с отступом и делает ровно 1024×1024 на полностью белом фоне.
Углы скругляют сами iPhone и Mac. Уже обработанный файл повторно не трогается."""
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter
from PIL.PngImagePlugin import PngInfo

BG = (255, 255, 255)   # цвет фона
MARGIN = 0.10          # отступ от края с каждой стороны (10%) — как у иконки со щитом
SIZE = 1024
MARK = "processed-v3"
PATH = sys.argv[1] if len(sys.argv) > 1 else "icon.png"


def near(a, b, tol=40):
    return all(abs(x - y) <= tol for x, y in zip(a, b))


def trim(im):
    mask = ImageChops.difference(im, Image.new("RGB", im.size, BG)).convert("L").point(lambda v: 255 if v > 18 else 0)
    # тонкие линии (сглаженные края бывшей рамки) не считаем рисунком
    mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
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

# 2. Снимаем рамки слоями. Рамка — это полоса одного цвета вдоль края картинки
#    (чёрный фон, тёмный скруглённый квадрат, уголки вокруг белой плашки).
#    Её заливаем белым от края и снова обрезаем пустые поля. Фото, которое касается
#    края, не трогаем — вдоль края у него разные цвета.
def edge_frames(im):
    w, h = im.size
    edges = {
        "top": [(x, 0) for x in range(int(w * .15), int(w * .85))],
        "bottom": [(x, h - 1) for x in range(int(w * .15), int(w * .85))],
        "left": [(0, y) for y in range(int(h * .15), int(h * .85))],
        "right": [(w - 1, y) for y in range(int(h * .15), int(h * .85))],
    }
    seeds = []
    for pts in edges.values():
        if not pts:
            continue
        cols = [im.getpixel(p) for p in pts]
        mid = cols[len(cols) // 2]
        if near(mid, BG, 12):
            continue
        same = sum(1 for c in cols if near(c, mid, 30)) / len(cols)
        if same >= 0.9:
            seeds.append(pts[len(pts) // 2])
    return seeds

for _ in range(6):
    im = trim(im)
    seeds = edge_frames(im)
    if not seeds:
        break
    for p in seeds:
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
