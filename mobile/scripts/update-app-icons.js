import fs from 'node:fs';
import path from 'node:path';

const generatedLogo = 'C:\\Users\\SHREY\\.gemini\\antigravity-ide\\brain\\8dc39d83-c312-4dc9-881d-753a7ee9997a\\velvet_brews_logo_1785926978808.png';

const destinations = [
  'd:/Velvet Brews/client/public/icon-192.png',
  'd:/Velvet Brews/client/public/icon-512.png',
  'd:/Velvet Brews/client/public/logo.png',
  'd:/Velvet Brews/mobile/public/icon-192.png',
  'd:/Velvet Brews/mobile/public/icon-512.png',
  'd:/Velvet Brews/mobile/public/logo.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png',
  'd:/Velvet Brews/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png',
];

console.log("Updating all app icons with the new luxury gold Velvet Brews emblem...");

for (const dest of destinations) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(generatedLogo, dest);
  console.log("Updated icon:", dest);
}

console.log("All app icons updated successfully!");
