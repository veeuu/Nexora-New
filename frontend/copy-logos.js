import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Script to copy logos from src to public folder
// Run this before building for production

const srcDir = path.join(__dirname, 'src', 'logos');
const destDir = path.join(__dirname, 'public', 'logos');

console.log('📁 Copying logos from src/logos to public/logos...');
console.log(`Source: ${srcDir}`);
console.log(`Destination: ${destDir}`);

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log('✓ Created public/logos directory');
}

// Copy all files
let copiedCount = 0;
let errorCount = 0;

try {
  const files = fs.readdirSync(srcDir);
  
  files.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    
    try {
      // Check if it's a file (not a directory)
      const stats = fs.statSync(srcFile);
      if (stats.isFile()) {
        fs.copyFileSync(srcFile, destFile);
        copiedCount++;
      }
    } catch (err) {
      console.error(`❌ Error copying ${file}:`, err.message);
      errorCount++;
    }
  });
  
  console.log(`\n✅ Successfully copied ${copiedCount} logo files`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} files had errors`);
  }
  
  // List some sample files to verify
  console.log('\n📋 Sample files copied:');
  const sampleFiles = fs.readdirSync(destDir).slice(0, 10);
  sampleFiles.forEach(file => console.log(`  - ${file}`));
  console.log(`  ... and ${copiedCount - 10} more files`);
  
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}

console.log('\n🎉 Logo copy complete!');
