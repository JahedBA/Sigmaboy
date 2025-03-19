#!/bin/bash

clear
echo -e "Welcome to the Surps Injector!"
echo -e "This script will inject Surps into the target application."

# Check if the necessary tools are available
if ! command -v curl &> /dev/null
then
    echo "Error: curl is not installed. Please install curl to proceed."
    exit 1
fi

if ! command -v unzip &> /dev/null
then
    echo "Error: unzip is not installed. Please install unzip to proceed."
    exit 1
fi

# Define the file paths
TARGET_APP="/Applications/Roblox.app"
DYLIB_URL="https://git.raptor.fun/main/surps.dylib"  # Replace this with the actual URL for Surps dylib
DYLIB_FILE="./surps.dylib"
INSERT_DYLIB_URL="https://git.raptor.fun/main/insert_dylib"  # Script to inject dylib into Roblox
INSERT_DYLIB="./insert_dylib"

# Step 1: Download Surps dylib
echo -n "Downloading Surps dylib... "
curl -s "$DYLIB_URL" -o "$DYLIB_FILE"
if [ ! -f "$DYLIB_FILE" ]; then
    echo "Error: Failed to download Surps dylib."
    exit 1
fi
echo "Done."

# Step 2: Download the insert_dylib script
echo -n "Downloading insert_dylib script... "
curl -s "$INSERT_DYLIB_URL" -o "$INSERT_DYLIB"
chmod +x "$INSERT_DYLIB"
if [ ! -f "$INSERT_DYLIB" ]; then
    echo "Error: Failed to download insert_dylib script."
    exit 1
fi
echo "Done."

# Step 3: Check if the target app exists
if [ ! -d "$TARGET_APP" ]; then
    echo "Error: Target application ($TARGET_APP) does not exist."
    exit 1
fi

# Step 4: Inject the Surps dylib into the target app (Roblox)
echo -n "Injecting Surps dylib into Roblox... "
"$INSERT_DYLIB" "$TARGET_APP/Contents/MacOS/RobloxPlayer" "$DYLIB_FILE" --strip-codesig --all-yes
if [ $? -eq 0 ]; then
    echo "Done."
else
    echo "Error: Failed to inject Surps dylib."
    exit 1
fi

# Step 5: Clean up
rm "$DYLIB_FILE"
rm "$INSERT_DYLIB"

echo -e "Injection complete! Surps has been injected into Roblox."

# Optional: Launch Roblox (or you can choose not to automatically launch)
echo -n "Launching Roblox... "
open -a "$TARGET_APP"
echo "Done."
exit
