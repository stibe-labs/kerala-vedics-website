import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ffmpeg = "C:\\Users\\abhis\\AppData\\Local\\Programs\\Python\\Python310\\Lib\\site-packages\\static_ffmpeg\\bin\\win32\\ffmpeg.exe";

const videos = [
  "hero-bottle.mp4",
  "freedon.mp4",
  "roll-on-animation.mp4",
  "botanical-infusion.mp4",
  "vericose.mp4",
  "vitality.mp4"
];

for (const vid of videos) {
  const src = path.resolve("public/videos", vid);
  const tmp = path.resolve("public/videos", `opt_${vid}`);
  if (!fs.existsSync(src)) continue;

  console.log(`Optimizing ${vid}...`);
  try {
    const cmd = `"${ffmpeg}" -i "${src}" -vf "scale='min(1920,iw)':-2" -c:v libx264 -crf 24 -preset fast -pix_fmt yuv420p -movflags +faststart -an "${tmp}" -y`;
    execSync(cmd, { stdio: "inherit" });
    const oldSize = fs.statSync(src).size;
    const newSize = fs.statSync(tmp).size;
    fs.unlinkSync(src);
    fs.renameSync(tmp, src);
    console.log(`✅ ${vid} compressed: ${Math.round(oldSize / 1024)} KB -> ${Math.round(newSize / 1024)} KB!`);
  } catch (e) {
    console.error(`Failed to optimize ${vid}:`, e);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

// Clean up test file if any
if (fs.existsSync("public/videos/hero-bottle-1080p.mp4")) {
  fs.unlinkSync("public/videos/hero-bottle-1080p.mp4");
}
if (fs.existsSync("public/videos/hero-bottle-opt.mp4")) {
  fs.unlinkSync("public/videos/hero-bottle-opt.mp4");
}

console.log("All videos optimized successfully!");
