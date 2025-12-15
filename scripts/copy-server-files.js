import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('📦 Starting server files copy process...');
console.log('📁 Root directory:', rootDir);

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

if (!fs.existsSync(serverSrc)) {
  console.error('❌ ERROR: server/ directory not found at:', serverSrc);
  process.exit(1);
}

if (!fs.existsSync(sharedSrc)) {
  console.error('❌ ERROR: shared/ directory not found at:', sharedSrc);
  process.exit(1);
}

console.log('📂 Copying server/ to api/server/...');
copyDir(serverSrc, serverDest);
console.log('✓ Copied server/ to api/server/');

console.log('📂 Copying shared/ to api/shared/...');
copyDir(sharedSrc, sharedDest);
console.log('✓ Copied shared/ to api/shared/');

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

// Verify that critical files were copied successfully
const criticalFiles = [
  path.join(serverDest, 'routes.ts'),
  path.join(serverDest, 'storage.ts'),
  path.join(serverDest, 'db.ts'),
  path.join(serverDest, 'auth.ts'),
  path.join(sharedDest, 'schema.ts')
];

let allFilesExist = true;
for (const file of criticalFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ ERROR: Critical file not found: ${file}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('❌ Failed to copy all required files!');
  process.exit(1);
}

console.log('✓ Verified: All critical files copied successfully');
console.log('✓ Server files copied and updated successfully');

