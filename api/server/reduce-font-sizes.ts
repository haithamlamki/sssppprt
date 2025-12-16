/**
 * Script to reduce font sizes across the project
 * Reduces all text size classes by one level
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Font size mapping: reduce by one level
const fontSizeMap: Record<string, string> = {
  "text-9xl": "text-7xl",
  "text-8xl": "text-6xl",
  "text-7xl": "text-5xl",
  "text-6xl": "text-4xl",
  "text-5xl": "text-3xl",
  "text-4xl": "text-2xl",
  "text-3xl": "text-xl",
  "text-2xl": "text-lg",
  "text-xl": "text-base",
  "text-lg": "text-sm",
  "text-base": "text-sm",
  "text-sm": "text-xs",
  // Keep text-xs as is or make it smaller
  "text-xs": "text-[10px]",
};

// Also handle responsive variants
const responsiveFontSizeMap: Record<string, string> = {
  "md:text-9xl": "md:text-7xl",
  "md:text-8xl": "md:text-6xl",
  "md:text-7xl": "md:text-5xl",
  "md:text-6xl": "md:text-4xl",
  "md:text-5xl": "md:text-3xl",
  "md:text-4xl": "md:text-2xl",
  "md:text-3xl": "md:text-xl",
  "md:text-2xl": "md:text-lg",
  "md:text-xl": "md:text-base",
  "md:text-lg": "md:text-sm",
  "md:text-base": "md:text-sm",
  "md:text-sm": "md:text-xs",
  "md:text-xs": "md:text-[10px]",
  
  "lg:text-9xl": "lg:text-7xl",
  "lg:text-8xl": "lg:text-6xl",
  "lg:text-7xl": "lg:text-5xl",
  "lg:text-6xl": "lg:text-4xl",
  "lg:text-5xl": "lg:text-3xl",
  "lg:text-4xl": "lg:text-2xl",
  "lg:text-3xl": "lg:text-xl",
  "lg:text-2xl": "lg:text-lg",
  "lg:text-xl": "lg:text-base",
  "lg:text-lg": "lg:text-sm",
  "lg:text-base": "lg:text-sm",
  "lg:text-sm": "lg:text-xs",
  "lg:text-xs": "lg:text-[10px]",
  
  "sm:text-9xl": "sm:text-7xl",
  "sm:text-8xl": "sm:text-6xl",
  "sm:text-7xl": "sm:text-5xl",
  "sm:text-6xl": "sm:text-4xl",
  "sm:text-5xl": "sm:text-3xl",
  "sm:text-4xl": "sm:text-2xl",
  "sm:text-3xl": "sm:text-xl",
  "sm:text-2xl": "sm:text-lg",
  "sm:text-xl": "sm:text-base",
  "sm:text-lg": "sm:text-sm",
  "sm:text-base": "sm:text-sm",
  "sm:text-sm": "sm:text-xs",
  "sm:text-xs": "sm:text-[10px]",
};

// Combine all mappings
const allMappings = { ...fontSizeMap, ...responsiveFontSizeMap };

function processFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;
    
    // Process each mapping
    for (const [oldSize, newSize] of Object.entries(allMappings)) {
      // Use word boundaries to match exact class names
      const regex = new RegExp(`\\b${oldSize.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newSize);
        modified = true;
      }
    }
    
    // Also handle custom text sizes like text-[14px] -> text-[12px]
    content = content.replace(/text-\[(\d+)px\]/g, (match, size) => {
      const numSize = parseInt(size);
      if (numSize > 10) {
        const newSize = Math.max(10, numSize - 2);
        modified = true;
        return `text-[${newSize}px]`;
      }
      return match;
    });
    
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

async function reduceFontSizes() {
  try {
    console.log("Starting to reduce font sizes...");
    
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
    console.error("Error reducing font sizes:", error);
    process.exit(1);
  }
}

// Run the script
reduceFontSizes()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });




