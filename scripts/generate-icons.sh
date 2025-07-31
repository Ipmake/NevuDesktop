#!/bin/bash

# Icon generation script using ImageMagick
# This script generates proper ICO, ICNS, and DMG background files from a source PNG

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ASSETS_DIR="$PROJECT_DIR/assets"
SRC_DIR="$PROJECT_DIR/src"

echo "Generating icon files..."

# Check if ImageMagick is installed
MAGICK_CMD=""
if command -v magick &> /dev/null; then
    MAGICK_CMD="magick"
    echo "Using ImageMagick v7 (magick command)"
elif command -v convert &> /dev/null; then
    MAGICK_CMD="convert"
    echo "Using ImageMagick v6 (convert command)"
else
    echo "❌ ImageMagick not found. Please install it:"
    echo "   Ubuntu/Debian: sudo apt install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo "   Fedora: sudo dnf install ImageMagick"
    exit 1
fi

# Find the source PNG
SOURCE_PNG=""
if [ -f "$ASSETS_DIR/icon.png" ]; then
    SOURCE_PNG="$ASSETS_DIR/icon.png"
    echo "Found PNG source icon at $SOURCE_PNG"
elif [ -f "$SRC_DIR/icon.png" ]; then
    SOURCE_PNG="$SRC_DIR/icon.png"
    echo "Found PNG source icon at $SOURCE_PNG"
else
    echo "❌ PNG icon not found in assets/ or src/ - cannot generate icons"
    exit 1
fi

# Create assets directory if it doesn't exist
mkdir -p "$ASSETS_DIR"

echo "Generating icons from $SOURCE_PNG..."

# Generate Windows ICO file (multiple sizes embedded)
echo "Generating Windows ICO..."
$MAGICK_CMD "$SOURCE_PNG" \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 64x64 \) \
    \( -clone 0 -resize 128x128 \) \
    \( -clone 0 -resize 256x256 \) \
    -delete 0 "$ASSETS_DIR/icon.ico"
echo "✓ Generated icon.ico (Windows)"

# Generate macOS ICNS file
echo "Generating macOS ICNS..."
if command -v iconutil &> /dev/null; then
    # Use macOS iconutil if available (better quality)
    TEMP_ICONSET="$ASSETS_DIR/icon.iconset"
    mkdir -p "$TEMP_ICONSET"
    
    # Generate all required sizes for ICNS
    $MAGICK_CMD "$SOURCE_PNG" -resize 16x16 "$TEMP_ICONSET/icon_16x16.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 32x32 "$TEMP_ICONSET/icon_16x16@2x.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 32x32 "$TEMP_ICONSET/icon_32x32.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 64x64 "$TEMP_ICONSET/icon_32x32@2x.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 128x128 "$TEMP_ICONSET/icon_128x128.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 256x256 "$TEMP_ICONSET/icon_128x128@2x.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 256x256 "$TEMP_ICONSET/icon_256x256.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 512x512 "$TEMP_ICONSET/icon_256x256@2x.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 512x512 "$TEMP_ICONSET/icon_512x512.png"
    $MAGICK_CMD "$SOURCE_PNG" -resize 1024x1024 "$TEMP_ICONSET/icon_512x512@2x.png"
    
    iconutil -c icns "$TEMP_ICONSET" -o "$ASSETS_DIR/icon.icns"
    rm -rf "$TEMP_ICONSET"
    echo "✓ Generated icon.icns (macOS) using iconutil"
else
    # Fallback to ImageMagick (Linux/Windows)
    $MAGICK_CMD "$SOURCE_PNG" \
        \( -clone 0 -resize 16x16 \) \
        \( -clone 0 -resize 32x32 \) \
        \( -clone 0 -resize 48x48 \) \
        \( -clone 0 -resize 128x128 \) \
        \( -clone 0 -resize 256x256 \) \
        \( -clone 0 -resize 512x512 \) \
        \( -clone 0 -resize 1024x1024 \) \
        -delete 0 "$ASSETS_DIR/icon.icns"
    echo "✓ Generated icon.icns (macOS) using ImageMagick"
fi

# Copy PNG to assets if it's in src
if [[ "$SOURCE_PNG" == *"/src/"* ]]; then
    cp "$SOURCE_PNG" "$ASSETS_DIR/icon.png"
    echo "✓ Copied icon.png to assets (Linux)"
else
    echo "✓ Using existing icon.png (Linux)"
fi

# Generate DMG background SVG
echo "Generating DMG background..."
cat > "$ASSETS_DIR/dmg-background.svg" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="660" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1e2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#11111b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="660" height="400" fill="url(#bg)"/>
  <text x="330" y="200" text-anchor="middle" fill="#cdd6f4" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Nevu Desktop</text>
  <text x="330" y="230" text-anchor="middle" fill="#a6adc8" font-family="Arial, sans-serif" font-size="14">Drag to Applications folder to install</text>
</svg>
EOF

# Convert SVG to PNG for DMG background
$MAGICK_CMD "$ASSETS_DIR/dmg-background.svg" "$ASSETS_DIR/dmg-background.png"
echo "✓ Generated dmg-background.svg (macOS DMG)"
echo "✓ Generated dmg-background.png (macOS DMG)"

echo ""
echo "Icon generation complete!"
echo ""
echo "Generated files:"
echo "  ✓ assets/icon.ico - Windows icon (multiple sizes)"
echo "  ✓ assets/icon.icns - macOS icon (multiple sizes)"
echo "  ✓ assets/icon.png - Linux icon"
echo "  ✓ assets/dmg-background.svg - macOS DMG background"
echo "  ✓ assets/dmg-background.png - DMG background PNG"
echo ""
echo "Icons are ready for production use!"
