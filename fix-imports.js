import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function fixImports(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixImports(fullPath);
    } else if (file.name.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Fix all relative imports that don't have .js extension
      let newContent = content.replace(
        /from\s+['"](\.\/.+?)['"];?/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            modified = true;
            return match.replace(importPath, importPath + '.js');
          }
          return match;
        }
      );
      
      // Also fix import statements (not just from)
      newContent = newContent.replace(
        /import\s+.*?\s+from\s+['"](\.\/.+?)['"];?/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            modified = true;
            return match.replace(importPath, importPath + '.js');
          }
          return match;
        }
      );

      // Fix path imports that go up directories
      newContent = newContent.replace(
        /from\s+['"](\.\.\/.+?)['"];?/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            modified = true;
            return match.replace(importPath, importPath + '.js');
          }
          return match;
        }
      );

      const finalContent = newContent.replace(
        /import\s+.*?\s+from\s+['"](\.\.\/.+?)['"];?/g,
        (match, importPath) => {
          if (!importPath.endsWith('.js')) {
            modified = true;
            return match.replace(importPath, importPath + '.js');
          }
          return match;
        }
      );
      
      if (modified) {
        fs.writeFileSync(fullPath, finalContent);
        console.log(`Fixed imports in: ${fullPath}`);
      }
    }
  }
}

fixImports(path.join(__dirname, 'dist'));
console.log('Fixed all imports!');