const fs = require('fs');
const path = require('path');

const validFiles = ['pending.md', 'close.md', 'broken.md', 'testing.md'];

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node update-trackers.js <filename> <status> <message>");
  console.error("Example: node update-trackers.js pending.md '[ ]' 'Add new payment gateway'");
  process.exit(1);
}

const [filename, status, ...messageParts] = args;
const message = messageParts.join(' ');

if (!validFiles.includes(filename)) {
  console.error(`Invalid file. Must be one of: ${validFiles.join(', ')}`);
  process.exit(1);
}

const filePath = path.join(__dirname, '..', filename);
const entry = `- ${status} ${message}\n`;

try {
  fs.appendFileSync(filePath, entry);
  console.log(`Successfully added entry to ${filename}`);
} catch (e) {
  console.error(`Error updating ${filename}:`, e);
}
