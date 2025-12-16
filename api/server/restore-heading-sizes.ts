/**
 * Script to restore heading font sizes to original values based on design guidelines
 * Hero Headlines: text-5xl md:text-7xl
 * Section Titles: text-3xl md:text-4xl
 * Body: text-base md:text-lg
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;
    
    // Replace h1 with text-base -> text-3xl md:text-4xl (Section Titles)
    content = content.replace(
      /<h1[^>]*className="[^"]*text-base\s+md:text-base[^"]*"/g,
      (match) => {
        modified = true;
        return match.replace(/text-base\s+md:text-base/g, "text-3xl md:text-4xl");
      }
    );
    
    // Replace h1 with text-base (no responsive) -> text-3xl
    content = content.replace(
      /<h1[^>]*className="[^"]*text-base[^"]*"/g,
      (match) => {
        if (!match.includes("md:text-")) {
          modified = true;
          return match.replace(/\btext-base\b/g, "text-3xl");
        }
        return match;
      }
    );
    
    // Replace h2 with text-base -> text-2xl md:text-3xl
    content = content.replace(
      /<h2[^>]*className="[^"]*text-base\s+md:text-base[^"]*"/g,
      (match) => {
        modified = true;
        return match.replace(/text-base\s+md:text-base/g, "text-2xl md:text-3xl");
      }
    );
    
    content = content.replace(
      /<h2[^>]*className="[^"]*text-base[^"]*"/g,
      (match) => {
        if (!match.includes("md:text-")) {
          modified = true;
          return match.replace(/\btext-base\b/g, "text-2xl");
        }
        return match;
      }
    );
    
    // Replace h3 with text-base -> text-xl md:text-2xl
    content = content.replace(
      /<h3[^>]*className="[^"]*text-base\s+md:text-base[^"]*"/g,
      (match) => {
        modified = true;
        return match.replace(/text-base\s+md:text-base/g, "text-xl md:text-2xl");
      }
    );
    
    content = content.replace(
      /<h3[^>]*className="[^"]*text-base[^"]*"/g,
      (match) => {
        if (!match.includes("md:text-")) {
          modified = true;
          return match.replace(/\btext-base\b/g, "text-xl");
        }
        return match;
      }
    );
    
    // Replace CardTitle with text-base -> text-xl
    content = content.replace(
      /<CardTitle[^>]*className="[^"]*text-base[^"]*"/g,
      (match) => {
        modified = true;
        return match.replace(/\btext-base\b/g, "text-xl");
      }
    );
    
    // Replace badges and small text - keep text-sm as is, but text-base in badges -> text-sm
    content = content.replace(
      /<Badge[^>]*className="[^"]*text-base[^"]*"/g,
      (match) => {
        modified = true;
        return match.replace(/\btext-base\b/g, "text-sm");
      }
    );
    
    // For body text in paragraphs, keep text-base but add md:text-lg
    content = content.replace(
      /<p[^>]*className="[^"]*text-base\s+md:text-base[^"]*"/g,
      (match) => {
        modified = true;
        return match.replace(/text-base\s+md:text-base/g, "text-base md:text-lg");
      }
    );
    
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

async function restoreHeadingSizes() {
  try {
    console.log("Starting to restore heading font sizes...");
    
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
    console.error("Error restoring heading sizes:", error);
    process.exit(1);
  }
}

// Run the script
restoreHeadingSizes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
