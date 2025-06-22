# macOS File Type Registration for .agent Files

This document describes how the .agent file type registration works on macOS and how to set it up.

## Overview

The .agent file type has been successfully registered on macOS with the following features:
- Native file type recognition with UTI identifier `com.nikbrazley.agent`
- Quick Look preview support (press Space on .agent files in Finder)
- Proper file type association in Finder and other macOS applications

## Registration Method

The successful registration method uses a macOS application bundle that declares the .agent file type through its Info.plist. This is the recommended approach by Apple for registering custom file types.

### The AgentFileType.app

The `AgentFileType.app` is a minimal macOS application that serves two purposes:
1. Registers the .agent file type with the system when launched
2. Provides the UTI (Uniform Type Identifier) declaration for .agent files

### Registration Process

1. **Run the creation script**:
   ```bash
   ./macos-registration/create-agent-app.sh
   ```

2. **Launch the app once**:
   ```bash
   open AgentFileType.app
   ```
   
   Or double-click it in Finder. This registers the file type with Launch Services.

3. **Optional: Keep the app**:
   You can move the app to `/Applications` if you want to ensure the registration persists:
   ```bash
   cp -r AgentFileType.app /Applications/
   ```

## Technical Details

### UTI Declaration

The .agent file type is declared with:
- **UTI**: `com.nikbrazley.agent`
- **Conforms to**: `public.plain-text` and `public.data`
- **File extension**: `agent`
- **MIME type**: `text/x-agent`

### Info.plist Structure

The app's Info.plist contains two key sections:

1. **CFBundleDocumentTypes**: Declares that the app can handle .agent files
2. **UTExportedTypeDeclarations**: Exports the .agent UTI for system-wide use

## Verification

After registration, you can verify it's working:

```bash
# Check UTI recognition
mdls -name kMDItemContentType example.agent
# Output: com.nikbrazley.agent

# Check all metadata
mdls example.agent

# Force Launch Services refresh (if needed)
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f AgentFileType.app
```

## Quick Look Support

Quick Look automatically works for .agent files after registration because:
1. The files conform to `public.plain-text`
2. macOS has built-in Quick Look support for text files
3. The .agent extension is now properly recognized

To test Quick Look:
1. Select any .agent file in Finder
2. Press the Space bar
3. The file contents should appear in a Quick Look preview window

## Troubleshooting

If registration doesn't seem to work:

1. **Reset Quick Look**:
   ```bash
   qlmanage -r cache
   qlmanage -r
   ```

2. **Kill Quick Look service**:
   ```bash
   killall -KILL QuickLookUIService
   ```

3. **Restart Finder**:
   ```bash
   killall Finder
   ```

4. **Re-register the app**:
   ```bash
   /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f AgentFileType.app
   ```

## Why This Method Works

This approach is successful because:
1. It follows Apple's recommended practice of using app bundles for file type registration
2. The UTI is properly exported through the app's Info.plist
3. Launch Services automatically picks up the registration when the app is launched
4. The app bundle provides a persistent registration that survives system updates

## Alternative Methods (Not Recommended)

Several other registration methods were attempted but were less reliable:
- Direct plist manipulation
- Using `defaults write` commands
- Manual UTI registration files

These methods often fail on modern macOS versions due to security restrictions and system integrity protection.

## Future Improvements

Potential enhancements:
1. Add a custom icon for .agent files
2. Create a proper viewer application instead of relying on Quick Look
3. Add file association so double-clicking opens a specific editor
4. Bundle the registration with the npm package installation