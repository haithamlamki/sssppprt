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

// Copy server and shared directories to both lib/ and api/
// lib/ is for Git tracking, api/ is for Vercel runtime (but ignored via .vercelignore)
const serverSrc = path.join(rootDir, 'server');
const serverDestLib = path.join(rootDir, 'lib', 'server');
const serverDestApi = path.join(rootDir, 'api', 'server');
const sharedSrc = path.join(rootDir, 'shared');
const sharedDestLib = path.join(rootDir, 'lib', 'shared');
const sharedDestApi = path.join(rootDir, 'api', 'shared');

if (!fs.existsSync(serverSrc)) {
  console.error('❌ ERROR: server/ directory not found at:', serverSrc);
  process.exit(1);
}

if (!fs.existsSync(sharedSrc)) {
  console.error('❌ ERROR: shared/ directory not found at:', sharedSrc);
  process.exit(1);
}

console.log('📂 Copying server/ to lib/server/...');
copyDir(serverSrc, serverDestLib);
console.log('✓ Copied server/ to lib/server/');

console.log('📂 Copying shared/ to lib/shared/...');
copyDir(sharedSrc, sharedDestLib);
console.log('✓ Copied shared/ to lib/shared/');

console.log('📂 Copying server/ to api/server/...');
copyDir(serverSrc, serverDestApi);
console.log('✓ Copied server/ to api/server/');

console.log('📂 Copying shared/ to api/shared/...');
copyDir(sharedSrc, sharedDestApi);
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

if (fs.existsSync(serverDestLib)) {
  updateImportsInDir(serverDestLib);
  console.log('✓ Updated imports in lib/server/ to use relative paths');
}

if (fs.existsSync(serverDestApi)) {
  updateImportsInDir(serverDestApi);
  console.log('✓ Updated imports in api/server/ to use relative paths');
}

// Verify that critical files were copied successfully
const criticalFiles = [
  path.join(serverDestLib, 'routes.ts'),
  path.join(serverDestLib, 'storage.ts'),
  path.join(serverDestLib, 'db.ts'),
  path.join(serverDestLib, 'auth.ts'),
  path.join(sharedDestLib, 'schema.ts'),
  path.join(serverDestApi, 'routes.ts'),
  path.join(serverDestApi, 'storage.ts'),
  path.join(serverDestApi, 'db.ts'),
  path.join(serverDestApi, 'auth.ts'),
  path.join(sharedDestApi, 'schema.ts')
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

