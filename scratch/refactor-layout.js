const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

if (!content.includes('import CollapsibleNavGroup')) {
  content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport CollapsibleNavGroup from "@/components/layout/CollapsibleNavGroup";');
}

// Transform Desktop & Mobile Sections
function transformNavSections(text) {
  // Main Menu
  text = text.replace(
    /<div className="pt-[26] pb-2">\s*<p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Menu<\/p>\s*<\/div>([\s\S]*?){\/\* AI Features \*\//g,
    '<CollapsibleNavGroup title="Main Menu" defaultOpen={true}>$1</CollapsibleNavGroup>\n\n          {/* AI Features */'
  );

  // AI Features
  text = text.replace(
    /<div className="pt-[26] pb-2">\s*<p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-fuchsia-500">AI Features<\/p>\s*<\/div>([\s\S]*?)({companyModules\.length > 0 \? \()/g,
    '<CollapsibleNavGroup title={<span className="text-fuchsia-500">AI Features</span>} defaultOpen={false}>$1</CollapsibleNavGroup>\n\n          $2'
  );

  // Industry Modules
  text = text.replace(
    /<>(\s*)<div className="pt-[26] pb-2">\s*<p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">\{industryName\} Modules<\/p>\s*<\/div>([\s\S]*?)<\/div>/g,
    '<CollapsibleNavGroup title={`${industryName} Modules`} defaultOpen={true}>$1$2</CollapsibleNavGroup>'
  );
  
  return text;
}

// Since Regex for nested HTML is fragile, let's just do targeted string replacements.

// Helper to replace block
function replaceBlock(startMarker, endMarker, newStart, newEnd) {
    // This is safer if we just do line by line or manual replacements.
}
