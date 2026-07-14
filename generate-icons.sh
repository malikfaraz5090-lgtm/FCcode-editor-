#!/bin/bash

echo "🎨 Generating App Icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not installed. Install it first:"
    echo "   sudo apt-get install imagemagick"
    exit 1
fi

# Convert SVG to PNG at different sizes
convert -background none -size 48x48 public/icons/icon.svg android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert -background none -size 72x72 public/icons/icon.svg android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert -background none -size 96x96 public/icons/icon.svg android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert -background none -size 144x144 public/icons/icon.svg android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert -background none -size 192x192 public/icons/icon.svg android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Round icons
convert -background none -size 48x48 \( public/icons/icon.svg -alpha set -channel A -evaluate set 50% \) android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
convert -background none -size 72x72 \( public/icons/icon.svg -alpha set -channel A -evaluate set 50% \) android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
convert -background none -size 96x96 \( public/icons/icon.svg -alpha set -channel A -evaluate set 50% \) android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
convert -background none -size 144x144 \( public/icons/icon.svg -alpha set -channel A -evaluate set 50% \) android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
convert -background none -size 192x192 \( public/icons/icon.svg -alpha set -channel A -evaluate set 50% \) android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

echo "✅ Icons generated successfully!"
echo "📱 Icons are in android/app/src/main/res/mipmap-*/"
