// This script patches the electron-deeplink module binding.gyp file
// to work correctly with macOS builds

const fs = require('fs');
const path = require('path');

function patchElectronDeeplink() {
  try {
    const appPath = path.join(process.cwd(), 'release', 'app');
    const modulePath = path.join(appPath, 'node_modules', 'electron-deeplink');

    if (!fs.existsSync(modulePath)) {
      console.log('electron-deeplink module not found, skipping patch');
      return;
    }

    const gyp = path.join(modulePath, 'binding.gyp');

    if (!fs.existsSync(gyp)) {
      console.log('binding.gyp not found in electron-deeplink module');
      return;
    }

    // Read the binding.gyp file
    let bindingContent = fs.readFileSync(gyp, 'utf8');

    // Add the necessary compiler flags for macOS
    if (
      process.platform === 'darwin' &&
      !bindingContent.includes('xcode_settings')
    ) {
      console.log('Patching electron-deeplink binding.gyp for macOS');

      // Find the targets array
      const targetsMatch = bindingContent.match(/"targets":\s*\[([\s\S]*?)\]/);

      if (targetsMatch && targetsMatch[1]) {
        // Get the content inside the targets array
        const targetContent = targetsMatch[1];

        // Check if there's a target object
        const targetObjectMatch = targetContent.match(/{([\s\S]*?)}/);

        if (targetObjectMatch && targetObjectMatch[0]) {
          // Add xcode_settings to the target
          const updatedTarget = targetObjectMatch[0].replace(
            /}$/,
            ',"xcode_settings": {"MACOSX_DEPLOYMENT_TARGET": "10.15", "OTHER_CFLAGS": ["-std=c++17", "-stdlib=libc++"], "OTHER_LDFLAGS": ["-stdlib=libc++"]}',
          );

          // Replace the original target with the updated one
          bindingContent = bindingContent.replace(
            targetObjectMatch[0],
            updatedTarget,
          );

          // Write the updated binding.gyp file
          fs.writeFileSync(gyp, bindingContent);
          console.log('electron-deeplink binding.gyp patched successfully');
        } else {
          console.log('Could not find target object in binding.gyp');
        }
      } else {
        console.log('Could not find targets array in binding.gyp');
      }
    } else {
      console.log(
        'No need to patch binding.gyp, not on macOS or already patched',
      );
    }
  } catch (error) {
    console.error('Error patching electron-deeplink:', error);
  }
}

patchElectronDeeplink();
