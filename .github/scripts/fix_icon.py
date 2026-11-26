"""Приводит icon.png в порядок для иконки приложения:
- заливает прозрачные места фоном (иначе iPhone и Mac рисуют их чёрными);
- обрезает пустые поля вокруг картинки;
- ставит содержимое по центру с небольшим отступом;
- делает ровно 1024×1024.
Уже обработанный файл помечается и повторно не трогается."""
import sys
from PIL import Image, ImageChops
from PIL.PngImagePlugin import PngInfo

BG = (255, 255, 255)      # цвет фона за прозрачными местами
MARGIN = 0.06             # отступ от края с каждой стороны (6%)
SIZE = 1024
PATH = sys.argv[1] if len(sys.argv) > 1 else "icon.png"

im = Image.open(PATH)
if im.info.get("sport-icon") == "processed":
    print("Иконка уже обработана — пропускаю")
    sys.exit(0)

# 1. Прозрачность → фон
im = im.convert("RGBA")
base = Image.new("RGBA", im.size, BG + (255,))
base.alpha_composite(im)
im = base.convert("RGB")

# 2. Обрезаем поля того же цвета, что и фон
mask = ImageChops.difference(im, Image.new("RGB", im.size, BG)).convert("L").point(lambda v: 255 if v > 18 else 0)
box = mask.getbbox()
if box:
    im = im.crop(box)

# 3. Квадрат с отступом и содержимым по центру
w, h = im.size
side = int(round(max(w, h) / (1 - 2 * MARGIN)))
canvas = Image.new("RGB", (side, side), BG)
canvas.paste(im, ((side - w) // 2, (side - h) // 2))

# 4. Итоговый размер
out = canvas.resize((SIZE, SIZE), Image.LANCZOS)
info = PngInfo()
info.add_text("sport-icon", "processed")
out.save(PATH, "PNG", pnginfo=info, optimize=True)
print(f"Готово: {PATH} → {SIZE}×{SIZE}, без прозрачности, поля обрезаны")
