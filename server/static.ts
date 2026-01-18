import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production, the built files are in dist/public
  // Try multiple possible paths to find the build directory
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(__dirname, "..", "public"),
    path.resolve(__dirname, "public"),
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
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(", ")}. Make sure to build the client first.`,
    );
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
