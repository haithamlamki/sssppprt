import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy server and shared directories to api/
const serverSrc = path.join(rootDir, 'server');
const serverDest = path.join(rootDir, 'api', 'server');
const sharedSrc = path.join(rootDir, 'shared');
const sharedDest = path.join(rootDir, 'api', 'shared');

if (fs.existsSync(serverSrc)) {
  copyDir(serverSrc, serverDest);
  console.log('✓ Copied server/ to api/server/');
}

if (fs.existsSync(sharedSrc)) {
  copyDir(sharedSrc, sharedDest);
  console.log('✓ Copied shared/ to api/shared/');
}

console.log('✓ Server files copied successfully');

