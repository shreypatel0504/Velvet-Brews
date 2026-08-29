import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const baseDir = 'd:/Velvet Brews/mobile/android-sdk/cmdline-tools';
const tempDir = 'd:/Velvet Brews/mobile/android-sdk/temp_tools';
const latestDir = path.join(baseDir, 'latest');

if (!fs.existsSync(latestDir)) {
  if (fs.existsSync(path.join(baseDir, 'bin'))) {
    fs.renameSync(baseDir, tempDir);
    fs.mkdirSync(baseDir, { recursive: true });
    fs.renameSync(tempDir, latestDir);
    console.log("Reorganized cmdline-tools to cmdline-tools/latest!");
  }
}

const sdkmanagerPath = path.join(latestDir, 'bin', 'sdkmanager.bat');
console.log("Installing Android platform 34 and build-tools 34.0.0...");

try {
  execSync(`cmd /c "echo y | \\"${sdkmanagerPath}\\" --sdk_root=\\"d:/Velvet Brews/mobile/android-sdk\\" \\"platforms;android-34\\" \\"build-tools;34.0.0\\" \\"platform-tools\\""`, {
    stdio: 'inherit',
    env: { ...process.env, JAVA_HOME: 'C:\\Program Files\\Java\\jdk-24' }
  });
  console.log("Android SDK Components Installed Successfully!");
} catch (err) {
  console.error("SDKManager Error:", err);
}
