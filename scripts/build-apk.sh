#!/bin/bash

echo "🚀 Faraz Code Editor - APK Build Script"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_DIR=$(pwd)
ANDROID_DIR="$PROJECT_DIR/android"
APK_OUTPUT="$ANDROID_DIR/app/build/outputs/apk/release"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java is required but not installed${NC}"
    exit 1
fi

# Check Android SDK
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}⚠️  ANDROID_HOME not set, trying to find Android SDK...${NC}"
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    else
        echo -e "${RED}❌ Android SDK not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment check passed${NC}"
echo ""

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build web app
echo "🔨 Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Web build successful${NC}"
echo ""

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Capacitor sync failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Capacitor sync successful${NC}"
echo ""

# Build APK
echo "📱 Building Android APK..."
cd "$ANDROID_DIR"
./gradlew assembleRelease

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ APK build failed${NC}"
    echo "Check the logs above for errors"
    exit 1
fi

echo -e "${GREEN}✅ APK build successful${NC}"
echo ""

# Check APK
if [ -f "$APK_OUTPUT/app-release.apk" ]; then
    APK_SIZE=$(du -h "$APK_OUTPUT/app-release.apk" | cut -f1)
    echo "📊 APK Details:"
    echo "   Location: $APK_OUTPUT/app-release.apk"
    echo "   Size: $APK_SIZE"
    echo ""
    echo -e "${GREEN}🎉 Build completed successfully!${NC}"
else
    echo -e "${RED}❌ APK file not found${NC}"
    exit 1
fi

# Build AAB for Play Store
echo ""
echo "🎯 Building Android App Bundle (AAB) for Play Store..."
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AAB build successful${NC}"
    AAB_OUTPUT="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
    if [ -f "$AAB_OUTPUT" ]; then
        AAB_SIZE=$(du -h "$AAB_OUTPUT" | cut -f1)
        echo "📊 AAB Details:"
        echo "   Location: $AAB_OUTPUT"
        echo "   Size: $AAB_SIZE"
    fi
fi

echo ""
echo "========================================"
echo "Build process completed!"
echo "========================================"
