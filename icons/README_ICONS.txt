ICON FILES NEEDED
==================

This extension requires three icon files:
- icon16.png (16x16 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)

QUICK SOLUTION: Download Free Icons
------------------------------------
1. Go to: https://www.flaticon.com/free-icon/copy_1621635
   Or search "document copy icon PNG" on Google Images
2. Download in three sizes or download once and resize
3. Save as icon16.png, icon48.png, icon128.png in this folder

ALTERNATIVE: Create Simple Placeholders
----------------------------------------
You can use any solid color squares as temporary placeholders:

On macOS with Python:
```bash
python3 << 'PYTHON_SCRIPT'
from PIL import Image, ImageDraw

sizes = [16, 48, 128]
for size in sizes:
    img = Image.new('RGB', (size, size), color='#1a73e8')
    draw = ImageDraw.Draw(img)
    # Draw white document shape
    margin = int(size * 0.2)
    draw.rectangle([margin, margin, size-margin, size-margin], fill='white')
    img.save(f'icon{size}.png')
    print(f'Created icon{size}.png')
PYTHON_SCRIPT
```

Or use any image (even a screenshot) and resize it:
```bash
sips -z 16 16 your-image.png --out icon16.png
sips -z 48 48 your-image.png --out icon48.png
sips -z 128 128 your-image.png --out icon128.png
```

EASIEST: Use Online Tool
------------------------
1. Go to: https://www.favicon-generator.org/
2. Upload any image (logo, screenshot, etc.)
3. Download the generated favicon package
4. Rename the appropriate sizes to icon16.png, icon48.png, icon128.png

The extension will NOT load until these files exist!
