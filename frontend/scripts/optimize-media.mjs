import { spawn } from "node:child_process";
import { mkdir, readdir, stat, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceRoot = path.join(frontendRoot, "media-originals", "projects");
const outputRoot = path.join(frontendRoot, "public", "projects");
const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);
const videoExtensions = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const files = [];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(filePath);
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }
}

function transcodeVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const temporaryPath = `${outputPath}.tmp.mp4`;
    const child = spawn(
      ffmpegPath,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-vf",
        "scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2",
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "27",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        temporaryPath,
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    let errorOutput = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      errorOutput += chunk;
    });
    child.on("error", reject);
    child.on("close", async (code) => {
      if (code !== 0) {
        await rm(temporaryPath, { force: true });
        reject(new Error(`Video optimization failed: ${errorOutput.trim()}`));
        return;
      }

      try {
        await rename(temporaryPath, outputPath);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

const sourceStats = await stat(sourceRoot).catch(() => null);
if (!sourceStats?.isDirectory()) {
  throw new Error(
    "Original media folder not found. Put source files in frontend/media-originals/projects.",
  );
}
if (!ffmpegPath) {
  throw new Error("FFmpeg is unavailable on this platform.");
}

await collectFiles(sourceRoot);
let totalSourceBytes = 0;
let totalOutputBytes = 0;

for (const inputPath of files) {
  const relativePath = path.relative(sourceRoot, inputPath);
  const extension = path.extname(inputPath).toLowerCase();
  const outputExtension = imageExtensions.has(extension) ? ".webp" : ".mp4";
  if (!imageExtensions.has(extension) && !videoExtensions.has(extension)) {
    continue;
  }

  const outputPath = path.join(
    outputRoot,
    relativePath.replace(/\.[^.]+$/, outputExtension),
  );
  await mkdir(path.dirname(outputPath), { recursive: true });

  const inputStat = await stat(inputPath);
  if (imageExtensions.has(extension)) {
    await sharp(inputPath, { animated: false })
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5, smartSubsample: true })
      .toFile(outputPath);
  } else {
    await transcodeVideo(inputPath, outputPath);
  }

  const outputStat = await stat(outputPath);
  totalSourceBytes += inputStat.size;
  totalOutputBytes += outputStat.size;
  console.log(
    `${path.relative(frontendRoot, outputPath)}: ${(inputStat.size / 1e6).toFixed(1)} MB -> ${(outputStat.size / 1e6).toFixed(1)} MB`,
  );
}

console.log(
  `Media optimized: ${(totalSourceBytes / 1e6).toFixed(1)} MB -> ${(totalOutputBytes / 1e6).toFixed(1)} MB`,
);
