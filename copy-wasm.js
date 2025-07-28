#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file and directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your library’s WASM file (inside node_modules)
const wasmSource = path.join(__dirname, 'dist', 'sql-wasm.wasm');

// Candidate folders in the consumer project
const consumerRoot = process.env.INIT_CWD || process.cwd();
const candidates = ['public', 'dist', 'build'];

let copied = false;

for (const folder of candidates) {
  const targetDir = path.join(consumerRoot, folder);
  const targetFile = path.join(targetDir, 'sql-wasm.wasm');

  if (fs.existsSync(targetDir)) {
    try {
      fs.copyFileSync(wasmSource, targetFile);
      console.log(`✅ sql-wasm.wasm copied to: ${folder}/`);
      copied = true;
    } catch (err) {
      console.error(`❌ Failed to copy to ${folder}:`, err.message);
    }
  }
}

if (!copied) {
  console.log(
    `📭 No target folder found. If working for browser environment, create one of: [public, dist, build] to receive sql-wasm.wasm.`
  );
}
