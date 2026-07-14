#!/bin/bash

echo "🎨 Generating Premium App Icons..."
echo "=================================="

ICON_SVG="public/icons/icon.svg"

# Create all mipmap folders
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
mkdir -p android/app/src/main/res/mipmap-anydpi-v26

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "✅ Using ImageMagick for high quality icons"
    
    # Generate regular icons
    convert -background none -resize 48x48 "$ICON_SVG" "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
    convert -background none -resize 72x72 "$ICON_SVG" "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
    convert -background none -resize 96x96 "$ICON_SVG" "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
    convert -background none -resize 144x144 "$ICON_SVG" "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
    convert -background none -resize 192x192 "$ICON_SVG" "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
    
    # Generate round icons
    convert -background none -resize 48x48 \( "$ICON_SVG" -alpha set \) "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"
    convert -background none -resize 72x72 \( "$ICON_SVG" -alpha set \) "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"
    convert -background none -resize 96x96 \( "$ICON_SVG" -alpha set \) "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"
    convert -background none -resize 144x144 \( "$ICON_SVG" -alpha set \) "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"
    convert -background none -resize 192x192 \( "$ICON_SVG" -alpha set \) "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"
    
    echo "✅ All PNG icons generated"
else
    echo "⚠️  ImageMagick not found, using vector icons"
fi

# Create adaptive icon (Android 8+)
cat > android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml << 'XMLEOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
XMLEOF

cat > android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml << 'XMLEOF'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
XMLEOF

# Create background drawable
cat > android/app/src/main/res/drawable/ic_launcher_background.xml << 'XMLEOF'
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
    <gradient
        android:startColor="#1a1a2e"
        android:endColor="#16213e"
        android:angle="135" />
    <corners android:radius="20dp" />
</shape>
XMLEOF

# Create foreground drawable
cat > android/app/src/main/res/drawable/ic_launcher_foreground.xml << 'XMLEOF'
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    
    <!-- Code brackets -->
    <group android:translateX="54" android:translateY="45">
        <path
            android:fillColor="#00d2ff"
            android:pathData="M-25,-15 L-15,-5 L-25,5"
            android:strokeWidth="3"
            android:strokeColor="#00d2ff"/>
        <path
            android:fillColor="#00d2ff"
            android:pathData="M25,-15 L15,-5 L25,5"
            android:strokeWidth="3"
            android:strokeColor="#00d2ff"/>
    </group>
    
    <!-- Text F -->
    <group android:translateX="54" android:translateY="75">
        <path
            android:fillColor="#FFFFFF"
            android:pathData="M-20,-10 L-10,-10 L-10,-2 L-8,-2 L-8,2 L-10,2 L-10,8 L-20,8 Z"/>
    </group>
</vector>
XMLEOF

echo "✅ Adaptive icons created"
echo "=================================="
echo "🎉 PREMIUM ICONS GENERATED!"
echo "📱 App will have beautiful 3D gradient icons"
echo "=================================="
