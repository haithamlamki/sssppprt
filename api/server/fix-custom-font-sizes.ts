/**
 * Script to replace all custom font sizes (text-[10px], text-[12px]) with proper Tailwind classes
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace custom pixel sizes with appropriate Tailwind classes
// text-[12px] -> text-base (for body text) or text-lg (for headings)
// text-[10px] -> text-sm (for small text)
const replacements: Array<{ pattern: RegExp; replacement: string }> = [
  // Replace text-[12px] with text-base (most common case for body text)
  { pattern: /\btext-\[12px\]/g, replacement: "text-base" },
  // Replace text-[10px] with text-sm
  { pattern: /\btext-\[10px\]/g, replacement: "text-sm" },
  // Replace responsive variants
  { pattern: /\bmd:text-\[12px\]/g, replacement: "md:text-base" },
  { pattern: /\bmd:text-\[10px\]/g, replacement: "md:text-sm" },
  { pattern: /\blg:text-\[12px\]/g, replacement: "lg:text-base" },
  { pattern: /\blg:text-\[10px\]/g, replacement: "lg:text-sm" },
  { pattern: /\bsm:text-\[12px\]/g, replacement: "sm:text-base" },
  { pattern: /\bsm:text-\[10px\]/g, replacement: "sm:text-sm" },
];

function processFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;
    
    for (const { pattern, replacement } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, "utf-8");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes("node_modules") && !filePath.includes(".git")) {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function fixCustomFontSizes() {
  try {
    console.log("Starting to fix custom font sizes...");
    
    const clientDir = path.join(__dirname, "..", "client", "src");
    const files = getAllTsxFiles(clientDir);
    
    console.log(`Found ${files.length} files to process`);
    
    let modifiedCount = 0;
    
    for (const file of files) {
      if (processFile(file)) {
        console.log(`Modified: ${path.relative(process.cwd(), file)}`);
        modifiedCount++;
      }
    }
    
    console.log("\n=== Summary ===");
    console.log(`Files processed: ${files.length}`);
    console.log(`Files modified: ${modifiedCount}`);
    console.log("Done!");
    
  } catch (error) {
    console.error("Error fixing font sizes:", error);
    process.exit(1);
  }
}

// Run the script
fixCustomFontSizes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
