import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

async function setupSDK() {
  const sdkDir = path.resolve('d:/Velvet Brews/mobile/android-sdk');
  console.log("Setting up lightweight Android SDK in:", sdkDir);
  
  if (!fs.existsSync(sdkDir)) {
    fs.mkdirSync(sdkDir, { recursive: true });
  }

  const zipPath = path.join(sdkDir, 'cmdline-tools.zip');
  const url = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip";

  console.log("Downloading Android Command Line Tools...");
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(zipPath, Buffer.from(buffer));
  console.log("Download finished. Extracting zip...");

  execSync(`tar -xf "${zipPath}" -C "${sdkDir}"`);
  fs.unlinkSync(zipPath);

  // Write local.properties for Gradle
  const localProps = `sdk.dir=${sdkDir.replace(/\\/g, '/')}\n`;
  fs.writeFileSync('d:/Velvet Brews/mobile/android/local.properties', localProps);
  console.log("Written local.properties with sdk.dir!");
}

setupSDK().catch(console.error);
