const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const isWin = process.platform === "win32";
const isMac = process.platform === "darwin";
const outName = isWin ? "xflow-agent.exe" : "xflow-agent";
const outPath = path.join(distDir, outName);
const blobPath = path.join(distDir, "sea-prep.blob");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log("[SEA] 1. Bundling source with esbuild...");
execSync(
  'npx esbuild src/index.ts --bundle --platform=node --target=node22 --outfile=dist/bundle.js',
  { cwd: rootDir, stdio: "inherit" }
);

console.log("[SEA] 2. Generating SEA preparation blob...");
execSync("node --experimental-sea-config sea-config.json", {
  cwd: rootDir,
  stdio: "inherit",
});

console.log(`[SEA] 3. Copying node binary to ${outPath}...`);
fs.copyFileSync(process.execPath, outPath);

if (isMac) {
  console.log("[SEA] 3.1 Removing signature on macOS...");
  execSync(`codesign --remove-signature "${outPath}"`, { stdio: "inherit" });
}

console.log("[SEA] 4. Injecting SEA blob with postject...");
const machoFlag = isMac ? " --macho-segment-name NODE_SEA" : "";
execSync(
  `npx postject "${outPath}" NODE_SEA_BLOB "${blobPath}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2${machoFlag}`,
  { cwd: rootDir, stdio: "inherit" }
);

if (!isWin) {
  fs.chmodSync(outPath, 0o755);
}

console.log(`\n[SEA] SUCCESS: Created standalone executable at ${outPath}\n`);
