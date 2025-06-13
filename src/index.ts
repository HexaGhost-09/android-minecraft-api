import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

type ApkAsset = {
  url: string;
  name: string;
  version: string;
  date: string;
};

async function fetchAllApks(): Promise<ApkAsset[]> {
  const res = await fetch(
    "https://api.github.com/repos/HexaGhost-09/minecraft-hub/releases"
  );
  const releases = await res.json();
  const apks: ApkAsset[] = [];
  for (const release of releases) {
    for (const asset of release.assets) {
      if (asset.name.endsWith(".apk")) {
        apks.push({
          url: asset.browser_download_url,
          name: asset.name,
          version: release.tag_name || release.name,
          date: release.published_at,
        });
      }
    }
  }
  // Sort by date, newest first
  apks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return apks;
}

app.get("/", (req, res) => {
  res.send("Welcome to the Minecraft APK API! Visit /apks to see available APKs.");
});

app.get("/apks", async (req, res) => {
  try {
    const apks = await fetchAllApks();
    res.json(apks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch APKs" });
  }
});

app.get("/apks/:version", async (req, res) => {
  try {
    const apks = await fetchAllApks();
    const apk = apks.find(a => a.version === req.params.version);
    if (apk) {
      res.json(apk);
    } else {
      res.status(404).json({ error: "Version not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch APKs" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});