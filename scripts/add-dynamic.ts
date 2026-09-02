import fs from 'fs';
import path from 'path';

function processDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name === 'route.ts' || (entry.name === 'page.tsx' && fullPath.includes('[id]'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes("export const dynamic = 'force-dynamic'")) {
        const lines = content.split('\n');
        // Find last import line
        let lastImportIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
          }
        }
        lines.splice(lastImportIndex + 1, 0, "\nexport const dynamic = 'force-dynamic';");
        content = lines.join('\n');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Added force-dynamic to:', path.relative(process.cwd(), fullPath));
      }
    }
  }
}

processDir(path.join(process.cwd(), 'app', 'api'));
processDir(path.join(process.cwd(), 'app', 'listings'));
processDir(path.join(process.cwd(), 'app', 'viewings'));
console.log('Done processing routes.');
