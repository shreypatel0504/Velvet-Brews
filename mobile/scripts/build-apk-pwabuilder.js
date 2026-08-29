import fs from 'node:fs';

async function generateAPK() {
  console.log("Requesting Android APK from PWABuilder API...");
  
  const payload = {
    manifestUrl: "https://velvetbrews.app/manifest.json",
    manifest: {
      name: "Velvet Brews",
      short_name: "Velvet Brews",
      start_url: "/",
      display: "standalone",
      background_color: "#120d0a",
      theme_color: "#120d0a",
      icons: [
        {
          src: "https://raw.githubusercontent.com/vitejs/vite/main/docs/public/logo.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    },
    packageId: "com.velvetbrews.app",
    host: "http://192.168.29.33:5174",
    appName: "Velvet Brews",
    launcherName: "Velvet Brews",
    themeColor: "#120d0a",
    navigationColor: "#120d0a",
    backgroundColor: "#120d0a",
    enableNotifications: true,
    splashScreenFadeOutDuration: 300,
    signing: {
      useTestKey: true
    }
  };

  try {
    const res = await fetch("https://pwabuilder-android-new.azurewebsites.net/generateAppPackage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    console.log("Status:", res.status);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      fs.writeFileSync("d:/Velvet Brews/VelvetBrews.apk", Buffer.from(buffer));
      console.log("Successfully generated d:/Velvet Brews/VelvetBrews.apk!");
    } else {
      const errText = await res.text();
      console.log("API Error:", errText);
    }
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

generateAPK();
