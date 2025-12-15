/**
 * Script to completely restore font sizes to original values
 * Replaces all custom text-[10px], text-[12px] with proper Tailwind classes
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping for custom pixel sizes to Tailwind classes
const customSizeMap: Record<string, string> = {
  "text-[10px]": "text-xs",
  "text-[12px]": "text-sm",
  "text-[14px]": "text-base",
  "text-[16px]": "text-base",
  "text-[18px]": "text-lg",
  "text-[20px]": "text-xl",
  "text-[24px]": "text-2xl",
  "text-[30px]": "text-3xl",
  "text-[36px]": "text-4xl",
};

// Responsive variants
const responsiveCustomSizeMap: Record<string, string> = {
  "md:text-[10px]": "md:text-xs",
  "md:text-[12px]": "md:text-sm",
  "md:text-[14px]": "md:text-base",
  "md:text-[16px]": "md:text-base",
  "md:text-[18px]": "md:text-lg",
  "md:text-[20px]": "md:text-xl",
  "md:text-[24px]": "md:text-2xl",
  "md:text-[30px]": "md:text-3xl",
  "md:text-[36px]": "md:text-4xl",
  
  "lg:text-[10px]": "lg:text-xs",
  "lg:text-[12px]": "lg:text-sm",
  "lg:text-[14px]": "lg:text-base",
  "lg:text-[16px]": "lg:text-base",
  "lg:text-[18px]": "lg:text-lg",
  "lg:text-[20px]": "lg:text-xl",
  "lg:text-[24px]": "lg:text-2xl",
  "lg:text-[30px]": "lg:text-3xl",
  "lg:text-[36px]": "lg:text-4xl",
  
  "sm:text-[10px]": "sm:text-xs",
  "sm:text-[12px]": "sm:text-sm",
  "sm:text-[14px]": "sm:text-base",
  "sm:text-[16px]": "sm:text-base",
  "sm:text-[18px]": "sm:text-lg",
  "sm:text-[20px]": "sm:text-xl",
  "sm:text-[24px]": "sm:text-2xl",
  "sm:text-[30px]": "sm:text-3xl",
  "sm:text-[36px]": "sm:text-4xl",
};

// Font size restoration mapping (reverse of reduction)
const fontSizeMap: Record<string, string> = {
  "text-xs": "text-sm",
  "text-sm": "text-base",
  "text-base": "text-xl",
  "text-lg": "text-2xl",
  "text-xl": "text-3xl",
  "text-2xl": "text-4xl",
  "text-3xl": "text-5xl",
  "text-4xl": "text-6xl",
  "text-5xl": "text-7xl",
  "text-6xl": "text-8xl",
  "text-7xl": "text-9xl",
};

const responsiveFontSizeMap: Record<string, string> = {
  "md:text-xs": "md:text-sm",
  "md:text-sm": "md:text-base",
  "md:text-base": "md:text-xl",
  "md:text-lg": "md:text-2xl",
  "md:text-xl": "md:text-3xl",
  "md:text-2xl": "md:text-4xl",
  "md:text-3xl": "md:text-5xl",
  "md:text-4xl": "md:text-6xl",
  "md:text-5xl": "md:text-7xl",
  "md:text-6xl": "md:text-8xl",
  "md:text-7xl": "md:text-9xl",
  
  "lg:text-xs": "lg:text-sm",
  "lg:text-sm": "lg:text-base",
  "lg:text-base": "lg:text-xl",
  "lg:text-lg": "lg:text-2xl",
  "lg:text-xl": "lg:text-3xl",
  "lg:text-2xl": "lg:text-4xl",
  "lg:text-3xl": "lg:text-5xl",
  "lg:text-4xl": "lg:text-6xl",
  "lg:text-5xl": "lg:text-7xl",
  "lg:text-6xl": "lg:text-8xl",
  "lg:text-7xl": "lg:text-9xl",
  
  "sm:text-xs": "sm:text-sm",
  "sm:text-sm": "sm:text-base",
  "sm:text-base": "sm:text-xl",
  "sm:text-lg": "sm:text-2xl",
  "sm:text-xl": "sm:text-3xl",
  "sm:text-2xl": "sm:text-4xl",
  "sm:text-3xl": "sm:text-5xl",
  "sm:text-4xl": "sm:text-6xl",
  "sm:text-5xl": "sm:text-7xl",
  "sm:text-6xl": "sm:text-8xl",
  "sm:text-7xl": "sm:text-9xl",
};

// Combine all mappings - process custom sizes first, then standard sizes
const allMappings = { 
  ...customSizeMap, 
  ...responsiveCustomSizeMap,
  ...fontSizeMap, 
  ...responsiveFontSizeMap 
};

function processFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;
    
    // First, replace custom pixel sizes with Tailwind classes
    // Process in reverse order (longest first) to avoid conflicts
    const sortedMappings = Object.entries(allMappings).sort((a, b) => {
      return b[0].length - a[0].length;
    });
    
    for (const [oldSize, newSize] of sortedMappings) {
      // Use word boundaries to match exact class names
      const regex = new RegExp(`\\b${oldSize.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newSize);
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

async function restoreFontSizesComplete() {
  try {
    console.log("Starting to completely restore font sizes to original...");
    
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
    console.error("Error restoring font sizes:", error);
    process.exit(1);
  }
}

// Run the script
restoreFontSizesComplete()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
