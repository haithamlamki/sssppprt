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

// Update imports in copied server files to use relative paths
function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace @shared/ with ../shared/ (handle both single and double quotes)
  content = content.replace(/from ["']@shared\//g, (match) => {
    const quote = match.includes('"') ? '"' : "'";
    return `from ${quote}../shared/`;
  });
  content = content.replace(/from ["']@shared["']/g, (match) => {
    const quote = match.includes('"') ? '"' : "'";
    return `from ${quote}../shared${quote}`;
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

function updateImportsInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      updateImportsInDir(fullPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      updateImportsInFile(fullPath);
    }
  }
}

if (fs.existsSync(serverDest)) {
  updateImportsInDir(serverDest);
  console.log('✓ Updated imports in api/server/ to use relative paths');
}

console.log('✓ Server files copied and updated successfully');

