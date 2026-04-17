const https = require('https');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Download premium customized PNG logo from Placeholder service
function downloadIcon(size, text, filename) {
  const url = `https://placehold.co/${size}x${size}/7c3aed/ffffff/png?text=${text}&font=roboto`;
  const dest = path.join(iconsDir, filename);

  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: Status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Saved ${filename}`);
        resolve();
      });
    }).on('error', reject);
  });
}

async function start() {
  console.log("Generating Premium Icons...");
  try {
    // We use the new 'logo' filename to perfectly bust the Google Chrome Cache.
    await downloadIcon(128, 'AI', 'logo128.png');
    await downloadIcon(48, 'AI', 'logo48.png');
    await downloadIcon(16, 'A', 'logo16.png');

    console.log("\n====================================");
    console.log("🎉 SUCCESS! Premium Logo Generated!");
    console.log("1. Icons successfully placed in /icons folder");
    console.log("2. You can safely Reload your Chrome Extension now!");
    console.log("====================================\n");
  } catch (err) {
    console.error("❌ Error generating icons:", err.message);
  }
}

start();
