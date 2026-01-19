import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production, the built files are in dist/public
  // __dirname will be 'dist' in the compiled file, so we resolve to dist/public
  // Try multiple possible paths to find the build directory
  const possiblePaths = [
    path.resolve(__dirname, "public"), // Most likely: dist/public (when __dirname is 'dist')
    path.resolve(process.cwd(), "dist", "public"), // Fallback: from project root
    path.resolve(process.cwd(), "public"), // Alternative location
    path.resolve(__dirname, "..", "public"), // Another fallback
  ];

  let distPath: string | null = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      distPath = testPath;
      console.log(`Found static files at: ${distPath}`);
      break;
    }
  }

  if (!distPath) {
    console.error(`Could not find build directory. Tried paths:`, possiblePaths);
    console.error(`Current working directory: ${process.cwd()}`);
    console.error(`__dirname: ${__dirname}`);
    // List what actually exists in the directories
    try {
      const distDir = path.resolve(__dirname);
      const cwdDist = path.resolve(process.cwd(), "dist");
      console.error(`Contents of ${distDir}:`, fs.existsSync(distDir) ? fs.readdirSync(distDir) : "does not exist");
      console.error(`Contents of ${cwdDist}:`, fs.existsSync(cwdDist) ? fs.readdirSync(cwdDist) : "does not exist");
    } catch (e) {
      console.error(`Error listing directories:`, e);
    }
    
    // Instead of throwing, log error and serve a diagnostic response
    // This allows the app to start so we can see what's wrong
    console.error("WARNING: Static files not found. App will start but serve diagnostic info.");
    app.use("*", (_req, res) => {
      res.status(500).json({ 
        error: "Static files not found. Check build process.",
        diagnostic: {
          paths: possiblePaths,
          cwd: process.cwd(),
          dirname: __dirname,
          distExists: fs.existsSync(path.resolve(process.cwd(), "dist")),
          distContents: fs.existsSync(path.resolve(process.cwd(), "dist")) 
            ? fs.readdirSync(path.resolve(process.cwd(), "dist"))
            : "dist directory does not exist"
        }
      });
    });
    return; // Don't throw - let the app start
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath!, "index.html");
    if (!fs.existsSync(indexPath)) {
      console.error(`index.html not found at: ${indexPath}`);
      return res.status(404).json({ error: "index.html not found" });
    }
    res.sendFile(indexPath);
  });
}
