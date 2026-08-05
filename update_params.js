const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace route handlers
  content = content.replace(
    /export async function (GET|POST|PUT|DELETE|PATCH)\(req: Request, \{ params \}: \{ params: \{ ([a-zA-Z0-9_]+): string \} \}\) \{/g,
    'export async function $1(req: Request, props: { params: Promise<{ $2: string }> }) {\n  const params = await props.params;'
  );

  // Replace page components
  content = content.replace(
    /export default function ([a-zA-Z0-9_]+)\(\{ params \}: \{ params: \{ ([a-zA-Z0-9_]+): string \} \}\) \{/g,
    'export default async function $1(props: { params: Promise<{ $2: string }> }) {\n  const params = await props.params;'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    changedCount++;
  }
});
console.log('Total changed:', changedCount);
