import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const binDir = path.resolve('d:/Velvet Brews/mobile/android-sdk/cmdline-tools/latest/bin');
const sdkRoot = 'C:\\AndroidSDK';

if (!fs.existsSync(sdkRoot)) {
  fs.mkdirSync(sdkRoot, { recursive: true });
}

console.log("Accepting all Android licenses...");
try {
  // Pipe 'y' 10 times to auto-accept all 6 license agreements
  execSync(`cmd /c "(for /l %i in (1,1,10) do @echo y) | sdkmanager.bat --sdk_root=${sdkRoot} --licenses"`, {
    cwd: binDir,
    stdio: 'inherit',
    env: { ...process.env, JAVA_HOME: 'C:\\Program Files\\Java\\jdk-24' }
  });
} catch (err) {}

console.log("Downloading Android Platform 34 & Build Tools 34.0.0...");
try {
  execSync(`cmd /c "echo y | sdkmanager.bat --sdk_root=${sdkRoot} platforms;android-34 build-tools;34.0.0 platform-tools"`, {
    cwd: binDir,
    stdio: 'inherit',
    env: { ...process.env, JAVA_HOME: 'C:\\Program Files\\Java\\jdk-24' }
  });
  
  // Write local.properties for Gradle
  const localProps = `sdk.dir=${sdkRoot.replace(/\\/g, '/')}\n`;
  fs.writeFileSync('d:/Velvet Brews/mobile/android/local.properties', localProps);
  console.log("ANDROID SDK 34 PACKAGES INSTALLED SUCCESSFULLY & local.properties updated!");
} catch (err) {
  console.error("Installation Error:", err);
}
