const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(srcDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    const replacements = {
      'bg-[var(--color-background)]': 'bg-background',
      'text-[var(--color-text-main)]': 'text-text-main',
      'border-[var(--color-border-subtle)]': 'border-border-subtle',
      'bg-[var(--color-surface-sidebar)]': 'bg-surface-sidebar',
      'text-[var(--color-text-secondary)]': 'text-text-secondary',
      'hover:bg-[var(--color-surface-main)]': 'hover:bg-surface-main',
      'text-[var(--color-text-muted)]': 'text-text-muted',
      'hover:border-[var(--color-border-subtle)]': 'hover:border-border-subtle',
      'bg-gradient-to-br': 'bg-linear-to-br',
      'bg-gradient-to-r': 'bg-linear-to-r',
      'before:bg-gradient-to-b': 'before:bg-linear-to-b',
      'flex-grow': 'grow',
      'flex-shrink-0': 'shrink-0',
      'min-h-[40px]': 'min-h-10',
      'h-[400px]': 'h-100',
      'blur-[40px]': 'blur-2xl',
      'min-w-[200px]': 'min-w-50',
      'min-w-[240px]': 'min-w-60',
      'h-[2px]': 'h-0.5',
      "className=\"block": "className=\"flex",
    };

    for (const [key, value] of Object.entries(replacements)) {
      if (content.includes(key)) {
        content = content.replaceAll(key, value);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
