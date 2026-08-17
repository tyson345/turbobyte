const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
};

const pages = walk('artifacts/turbobyte/src/pages');
const components = walk('artifacts/turbobyte/src/components');
const files = [...pages, ...components];

const replacements = [
  // Padding Y
  { regex: /(?<!md:)py-40/g, replacement: 'py-20 md:py-40' },
  { regex: /(?<!md:)py-32/g, replacement: 'py-16 md:py-32' },
  { regex: /(?<!md:)py-24/g, replacement: 'py-12 md:py-24' },
  { regex: /(?<!md:)py-16/g, replacement: 'py-10 md:py-16' },
  { regex: /(?<!md:)pt-32/g, replacement: 'pt-16 md:pt-32' },
  { regex: /(?<!md:)pt-24/g, replacement: 'pt-16 md:pt-24' },
  { regex: /(?<!md:)pb-12/g, replacement: 'pb-8 md:pb-12' },
  { regex: /(?<!md:)pb-16/g, replacement: 'pb-10 md:pb-16' },
  // Padding all
  { regex: /p-12 md:p-16/g, replacement: 'p-6 sm:p-8 md:p-16' },
  { regex: /p-8 md:p-10/g, replacement: 'p-6 sm:p-8 md:p-10' },
  { regex: /(?<!md:)p-10/g, replacement: 'p-6 md:p-10' },
  { regex: /(?<!md:)p-12/g, replacement: 'p-6 md:p-12' },
  // Typography
  { regex: /text-5xl md:text-7xl/g, replacement: 'text-4xl md:text-7xl' },
  { regex: /text-5xl sm:text-6xl font-bold/g, replacement: 'text-4xl sm:text-5xl md:text-6xl font-bold' },
  { regex: /text-4xl md:text-6xl/g, replacement: 'text-3xl sm:text-4xl md:text-6xl' },
  { regex: /text-4xl md:text-5xl/g, replacement: 'text-3xl sm:text-4xl md:text-5xl' },
  { regex: /text-3xl md:text-4xl/g, replacement: 'text-2xl sm:text-3xl md:text-4xl' },
  // Gaps (only in specific common patterns to avoid breaking grid column counts etc.)
  { regex: /gap-12/g, replacement: 'gap-8 md:gap-12' },
  { regex: /gap-16/g, replacement: 'gap-8 md:gap-16' },
  // Trust points in home
  { regex: /gap-x-12 gap-y-6/g, replacement: 'gap-x-6 gap-y-4 md:gap-x-12 md:gap-y-6' },
];

let changedFiles = [];

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  replacements.forEach(({ regex, replacement }) => {
    // A bit hacky to ensure we don't accidentally replace something already replaced, 
    // but the negative lookbehinds help.
    content = content.replace(regex, (match) => {
      // If the replacement is already in the string somewhere near, skip it.
      // E.g., if we match py-24, and it's already 'py-16 md:py-24', we don't want to change it.
      // But the regex should only match 'py-24' not preceded by 'md:'.
      // However, what if it's 'py-12 md:py-24'? The negative lookbehind `(?<!md:)` handles `md:py-24`.
      // What about `py-24 md:py-32`? That would become `py-12 md:py-24 md:py-32` which is redundant but okay.
      return replacement;
    });
  });

  // Break-all on email links
  content = content.replace(/className="([^"]*hover:text-primary[^"]*)"\s*data-testid="link-(footer|about|contact)-email"/g, 'className="$1 break-all" data-testid="link-$2-email"');

  // Fix w-64 h-64 blur blobs extending past viewport if parent isn't overflow-hidden
  // Actually, we can just add `overflow-x-hidden` to the main div in App.tsx or index.css
  // Let's do it in App.tsx layout.

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles.push(file);
  }
});

console.log("Changed files:", changedFiles);
