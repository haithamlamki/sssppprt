/**
 * Script to add team logos to existing teams
 * Maps logo images to teams by name
 */

import { db } from "./db";
import { teams } from "../shared/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";

// Map team names to logo file names
const teamLogoMap: Record<string, string> = {
  "ADAM BASE": "image-2910b5d2-3a74-43ab-b2c5-ef225a056d29.png",
  "DRILLING & MAINTENANCE": "image-02d849c1-e069-4469-b853-11e4c3bf05a4.png",
  "FINANCE": "image-d532afb3-c8e7-4fd5-a614-09f971d43afe-e3865c22-3329-4357-ae46-1664ad4ef91a.png",
  "HUMAN CAPITAL & INFITECH": "image-e75728fa-7add-43d1-b9a9-8d96b7ea81e1.png",
  "IT & MRKT": "image-0afef186-76d4-4d20-8b1a-3a4018b63269.png",
  "PROCUREMENT, WH & BUSINESS SUPPORT & BS": "image-a5b8f6da-1d26-4efe-81a3-c09c7c2128c1.png",
  "Q&C, LOGISTICS, AUDIT AND A & P": "image-f98d318a-197f-4a81-a478-02a293e99fb7.png",
  "WELL SERVICES & HSE": "image-492d7233-ca6a-4d80-a9a7-5f8c921f446a-e008cf4d-5655-4699-bf3a-cb92f60114a3.png",
};

async function addTeamLogos() {
  try {
    console.log("Starting to add team logos...");
    
    // Get all teams
    const allTeams = await db.select().from(teams);
    console.log(`Found ${allTeams.length} teams in database`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("Created uploads directory");
    }
    
    // Source directory for logo images - use absolute path from image_files
    const baseAssetsPath = "C:\\Users\\Haith\\.cursor\\projects\\c-Projects-abraj-sport-sport1-abraj-sport\\assets";
    const possibleSourceDirs = [
      baseAssetsPath,
      path.join(process.cwd(), "assets"),
      path.join(process.cwd(), "..", "assets"),
    ];
    
    let sourceDir: string | null = null;
    for (const dir of possibleSourceDirs) {
      if (fs.existsSync(dir)) {
        // Check if any logo files exist in this directory
        const files = fs.readdirSync(dir, { recursive: true });
        const hasLogoFiles = files.some((file: string) => 
          typeof file === 'string' && file.includes('image-') && file.endsWith('.png')
        );
        if (hasLogoFiles) {
          sourceDir = dir;
          break;
        }
      }
    }
    
    if (!sourceDir) {
      console.error("Could not find source directory for logo images");
      console.log("Searched in:", possibleSourceDirs);
      process.exit(1);
    }
    
    console.log(`Using source directory: ${sourceDir}`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each team
    for (const team of allTeams) {
      const logoFileName = teamLogoMap[team.name];
      
      if (!logoFileName) {
        console.log(`No logo mapping found for team: ${team.name}`);
        skippedCount++;
        continue;
      }
      
      // Check if source file exists (search recursively)
      let sourcePath: string | null = null;
      const searchForFile = (dir: string): string | null => {
        try {
          const files = fs.readdirSync(dir, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
              const found = searchForFile(fullPath);
              if (found) return found;
            } else if (file.name === logoFileName || file.name.includes(logoFileName.replace('image-', '').split('-')[0])) {
              return fullPath;
            }
          }
        } catch (error) {
          // Ignore errors
        }
        return null;
      };
      
      sourcePath = searchForFile(sourceDir);
      
      if (!sourcePath || !fs.existsSync(sourcePath)) {
        console.log(`Source logo file not found: ${logoFileName} in ${sourceDir}`);
        skippedCount++;
        continue;
      }
      
      console.log(`Found logo file: ${sourcePath}`);
      
      // Copy file to uploads directory with a unique name
      const fileExt = path.extname(logoFileName);
      const uniqueFileName = `team-logo-${team.id}${fileExt}`;
      const destPath = path.join(uploadsDir, uniqueFileName);
      
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied logo for ${team.name} to ${destPath}`);
      
      // Update database with logo URL
      const logoUrl = `/uploads/${uniqueFileName}`;
      await db
        .update(teams)
        .set({ logoUrl })
        .where(eq(teams.id, team.id));
      
      console.log(`Updated ${team.name} with logo URL: ${logoUrl}`);
      updatedCount++;
    }
    
    console.log("\n=== Summary ===");
    console.log(`Successfully updated: ${updatedCount} teams`);
    console.log(`Skipped: ${skippedCount} teams`);
    console.log("Done!");
    
  } catch (error) {
    console.error("Error adding team logos:", error);
    process.exit(1);
  }
}

// Run the script
addTeamLogos()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });

