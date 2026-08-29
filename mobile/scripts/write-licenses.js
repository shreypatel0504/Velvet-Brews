import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const sdkRoot = 'C:\\AndroidSDK';
const licensesDir = path.join(sdkRoot, 'licenses');

if (!fs.existsSync(licensesDir)) {
  fs.mkdirSync(licensesDir, { recursive: true });
}

// Write Android SDK License hashes
const androidSdkLicense = `89330172245f95f15767272f6f3008a73526519d\n24333f8a63b6825ea9c5514f83c2829b004d1fee\nd56f5187479451eabf01fb78af6dfcb131a6481e`;
const androidPreviewLicense = `84831b9402116da57f5c1491572c13612638e55b`;
const googleTvLicense = `33b6a2b64607f11b759f320ef9dff4ae5c47d97a`;

fs.writeFileSync(path.join(licensesDir, 'android-sdk-license'), androidSdkLicense);
fs.writeFileSync(path.join(licensesDir, 'android-googletv-license'), googleTvLicense);
fs.writeFileSync(path.join(licensesDir, 'android-sdk-preview-license'), androidPreviewLicense);

console.log("Android SDK Licenses written to disk!");

const binDir = path.resolve('d:/Velvet Brews/mobile/android-sdk/cmdline-tools/latest/bin');

console.log("Installing Android Platform 34 and Build Tools 34.0.0...");
try {
  execSync(`cmd /c "sdkmanager.bat --sdk_root=${sdkRoot} platforms;android-34 build-tools;34.0.0 platform-tools"`, {
    cwd: binDir,
    stdio: 'inherit',
    env: { ...process.env, JAVA_HOME: 'C:\\Program Files\\Java\\jdk-24' }
  });
  
  // Update local.properties for Capacitor project
  const localProps = `sdk.dir=${sdkRoot.replace(/\\/g, '/')}\n`;
  fs.writeFileSync('d:/Velvet Brews/mobile/android/local.properties', localProps);
  console.log("ANDROID SDK 34 INSTALLED SUCCESSFULLY & local.properties updated!");
} catch (err) {
  console.error("SDKManager Installation Error:", err);
}
