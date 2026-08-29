import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const base = 'd:/Velvet Brews/mobile/android-sdk/cmdline-tools';
const latest = path.join(base, 'latest');

if (!fs.existsSync(path.join(latest, 'bin'))) {
  fs.cpSync(path.join(base, 'bin'), path.join(latest, 'bin'), { recursive: true });
}
if (!fs.existsSync(path.join(latest, 'lib'))) {
  fs.cpSync(path.join(base, 'lib'), path.join(latest, 'lib'), { recursive: true });
}

console.log("SDK Structure Verified!");

const sdkmanager = 'd:\\Velvet Brews\\mobile\\android-sdk\\cmdline-tools\\latest\\bin\\sdkmanager.bat';
console.log("Running sdkmanager from:", sdkmanager);

try {
  const cmd = `echo y | "${sdkmanager}" --sdk_root="d:\\Velvet Brews\\mobile\\android-sdk" "platforms;android-34" "build-tools;34.0.0" "platform-tools"`;
  console.log("Executing:", cmd);
  execSync(cmd, {
    stdio: 'inherit',
    env: { ...process.env, JAVA_HOME: 'C:\\Program Files\\Java\\jdk-24' }
  });
  console.log("Android Platform 34 and Build Tools successfully installed!");
} catch (err) {
  console.error("Error running sdkmanager:", err);
}
