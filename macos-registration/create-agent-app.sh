#!/bin/bash

echo "🎯 Creating Agent File Type Registration App for macOS..."
echo ""

# Create app bundle structure
APP_NAME="DotAgent"
APP_DIR="$APP_NAME.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

# Clean up any existing app
rm -rf "$APP_DIR"

# Create directory structure
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

# Create a minimal executable
cat > "$MACOS_DIR/$APP_NAME" << 'EOF'
#!/bin/bash
# This is a minimal app that registers the .agent file type
echo ".agent Type registered successfully!"
echo "You can now close this window."
sleep 2
EOF

chmod +x "$MACOS_DIR/$APP_NAME"

# Create the Info.plist with proper UTI declarations
cat > "$CONTENTS_DIR/Info.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>DotAgent</string>
    <key>CFBundleIdentifier</key>
    <string>com.nikbrazley.dotagent</string>
    <key>CFBundleName</key>
    <string>Agent File Type</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    
    <!-- Document Types -->
    <key>CFBundleDocumentTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeName</key>
            <string>Agent File</string>
            <key>CFBundleTypeRole</key>
            <string>Viewer</string>
            <key>LSHandlerRank</key>
            <string>Default</string>
            <key>LSItemContentTypes</key>
            <array>
                <string>com.nikbrazley.agent</string>
            </array>
        </dict>
    </array>
    
    <!-- Exported Type Declaration -->
    <key>UTExportedTypeDeclarations</key>
    <array>
        <dict>
            <key>UTTypeIdentifier</key>
            <string>com.nikbrazley.agent</string>
            <key>UTTypeDescription</key>
            <string>Agent File</string>
            <key>UTTypeIconFile</key>
            <string>AgentIcon</string>
            <key>UTTypeConformsTo</key>
            <array>
                <string>public.plain-text</string>
                <string>public.data</string>
            </array>
            <key>UTTypeTagSpecification</key>
            <dict>
                <key>public.filename-extension</key>
                <array>
                    <string>agent</string>
                </array>
                <key>public.mime-type</key>
                <array>
                    <string>text/x-agent</string>
                </array>
            </dict>
        </dict>
    </array>
</dict>
</plist>
EOF

# Create a simple icon file (text file that says "AGENT")
echo "AGENT" > "$RESOURCES_DIR/AgentIcon.txt"

echo "✅ .agent File Type app created!"
echo ""
echo "📝 Next steps:"
echo "1. Double-click $APP_DIR to launch it once (this registers the file type)"
echo "2. You can then move the app to /Applications if you want to keep it"
echo "3. The .agent file type is now registered with macOS"
echo ""
echo "🔄 To refresh the system:"
echo "   /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f $APP_DIR"
echo ""
echo "🧪 To test:"
echo "   mdls -name kMDItemContentType test.agent"
echo "   It should show: com.nikbrazley.agent"
