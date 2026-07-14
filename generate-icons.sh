#!/bin/bash

echo "🎨 Generating App Icons..."

# Create SVG icon
cat > /tmp/icon.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#007acc"/>
      <stop offset="100%" style="stop-color:#003d6b"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#bg)"/>
  <text x="256" y="280" text-anchor="middle" fill="white" font-size="240" font-weight="bold" font-family="monospace">&lt;/&gt;</text>
  <text x="256" y="420" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="60" font-family="monospace">FCE</text>
</svg>
SVGEOF

# Check if ImageMagick available
if command -v convert &> /dev/null; then
    # Generate all sizes
    for size in 48 72 96 144 192; do
        case $size in
            48) folder="mdpi" ;;
            72) folder="hdpi" ;;
            96) folder="xhdpi" ;;
            144) folder="xxhdpi" ;;
            192) folder="xxxhdpi" ;;
        esac
        
        mkdir -p "android/app/src/main/res/mipmap-${folder}"
        convert -background none -resize ${size}x${size} /tmp/icon.svg "android/app/src/main/res/mipmap-${folder}/ic_launcher.png"
        convert -background none -resize ${size}x${size} /tmp/icon.svg "android/app/src/main/res/mipmap-${folder}/ic_launcher_round.png"
        echo "✅ Generated ${size}x${size} icon"
    done
else
    echo "⚠️  ImageMagick not installed. Using simple approach..."
    # Create simple XML-based adaptive icon
    mkdir -p android/app/src/main/res/mipmap-anydpi-v26
    
    cat > android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml << 'XMLEOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/primary"/>
    <foreground android:drawable="@color/white"/>
</adaptive-icon>
XMLEOF
    
    cat > android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml << 'XMLEOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/primary"/>
    <foreground android:drawable="@color/white"/>
</adaptive-icon>
XMLEOF
fi

echo "✅ Icons generated!"
