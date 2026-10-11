import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const guidesDir = path.join(repoRoot, 'public', 'guides');
const outputFile = path.join(guidesDir, 'index.json');

function parseYamlValue(val) {
  const trimmed = val.trim();
  if (!trimmed) return null;

  // Inline arrays: [item1, item2]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => parseYamlValue(item.trim()));
  }

  // Quoted strings
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Booleans / null
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  if (trimmed.toLowerCase() === 'null') return null;

  // Numbers
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);

  return trimmed;
}

function parseYamlFrontmatter(content) {
  const match = content.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const lines = match[1].split(/\r?\n/);
  const frontmatter = {};
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;

    // List item
    const listMatch = line.match(/^\s*-\s*(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey] = [];
      }
      frontmatter[currentKey].push(parseYamlValue(listMatch[1].trim()));
      continue;
    }

    // Key-value pair
    const kvMatch = line.match(/^\s*([a-zA-Z0-9_\-]+)\s*:\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const rawValue = kvMatch[2].trim();
      currentKey = key;

      if (!rawValue) {
        frontmatter[key] = [];
      } else {
        frontmatter[key] = parseYamlValue(rawValue);
      }
    }
  }

  return frontmatter;
}

console.log(`Scanning guides in: ${guidesDir}`);

if (!fs.existsSync(guidesDir)) {
  console.error(`Guides directory not found: ${guidesDir}`);
  process.exit(1);
}

const files = fs
  .readdirSync(guidesDir)
  .filter((f) => f.endsWith('.md'))
  .sort();

console.log(`Found ${files.length} markdown guide(s).`);

const guidesIndex = files.map((fileName) => {
  console.log(`  -> Processing ${fileName}...`);
  const fullPath = path.join(guidesDir, fileName);
  const content = fs.readFileSync(fullPath, 'utf8');
  const frontmatter = parseYamlFrontmatter(content);
  const baseName = path.basename(fileName, '.md');

  return {
    slug: frontmatter.slug || baseName.toLowerCase(),
    filename: fileName,
    ...frontmatter,
  };
});

fs.writeFileSync(outputFile, JSON.stringify(guidesIndex, null, 2), 'utf8');
console.log(`Successfully generated guide index at: ${outputFile}`);
