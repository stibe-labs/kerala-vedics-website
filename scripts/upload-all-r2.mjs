import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const videosDir = path.resolve("public/videos");
const files = fs.readdirSync(videosDir).filter((f) => f.endsWith(".mp4"));

console.log(`Found ${files.length} videos to upload to R2...`);

for (const file of files) {
  const filePath = path.join(videosDir, file);
  const r2Key = `kerala-vedics-media/videos/${file}`;
  console.log(`Uploading ${file}...`);
  try {
    execSync(
      `npx wrangler r2 object put ${r2Key} --file="${filePath}" --content-type="video/mp4" --remote`,
      { stdio: "inherit" }
    );
    console.log(`Uploaded ${file} successfully!`);
  } catch (err) {
    console.error(`Failed to upload ${file}:`, err);
  }
}

console.log("All videos uploaded to R2!");
