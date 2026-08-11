#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exampleRoot = path.resolve(process.argv[2] ?? path.join(repositoryRoot, 'examples/sanitized-complete-example'));
const errors = [];

const schemas = new Map([
  ['input/capture-plan.csv', ['Evidence ID', 'Planned state', 'Allowed action', 'Expected evidence', 'Observed result']],
  ['indexes/screenshot_index.csv', ['Evidence ID', 'File', 'Slug', 'Screenshot path', 'SHA-256', 'Format', 'Width', 'Height', 'Bytes', 'UI tree path', 'UI tree status', 'Notes']],
  ['indexes/interface_index.csv', ['Evidence ID', 'File', 'Slug', 'Visible text and descriptions', 'Actionable control summary', 'Screenshot path', 'UI tree path', 'UI tree status']],
  ['indexes/control_coverage.csv', ['Evidence ID', 'Screenshot', 'Slug', 'Class', 'Resource ID', 'Text', 'Content description', 'Clickable', 'Long-clickable', 'Checkable', 'Checked', 'Enabled', 'Selected', 'Bounds', 'Center X', 'Center Y', 'UI tree status']],
  ['indexes/coverage_gaps.csv', ['Evidence ID', 'File', 'Gap type', 'Recommended handling']],
  ['analysis/capability-matrix.csv', ['Capability ID', 'Capability family', 'Capability', 'Observed behavior', 'Evidence IDs', 'Status', 'Strength', 'Limitation', 'Comparison note', 'Priority']],
  ['analysis/system-interface-evidence.csv', ['Module', 'Interface type', 'Interface or target', 'Trigger', 'Evidence source', 'Evidence path', 'Status', 'Directly proven', 'Not proven', 'Notes']],
]);

const requiredMarkdown = [
  'README.md',
  'README.en.md',
  'input/scope.md',
  'input/scope.en.md',
  'reports/final-report.md',
  'reports/final-report.en.md',
];

function fail(message) {
  errors.push(message);
}

function parseCsv(text, relative) {
  const records = [];
  let record = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field === '') {
      quoted = true;
    } else if (character === ',') {
      record.push(field);
      field = '';
    } else if (character === '\n') {
      record.push(field.replace(/\r$/, ''));
      records.push(record);
      record = [];
      field = '';
    } else {
      field += character;
    }
  }

  if (quoted) fail(`${relative}: unterminated quoted CSV field`);
  if (field !== '' || record.length > 0) {
    record.push(field.replace(/\r$/, ''));
    records.push(record);
  }
  while (records.length > 0 && records.at(-1).every((value) => value === '')) records.pop();
  return records;
}

function readTable(relative) {
  const absolute = path.join(exampleRoot, relative);
  if (!fs.existsSync(absolute)) {
    fail(`missing ${relative}`);
    return [];
  }
  const records = parseCsv(fs.readFileSync(absolute, 'utf8'), relative);
  const expectedHeader = schemas.get(relative);
  if (records.length === 0) {
    fail(`${relative}: empty CSV`);
    return [];
  }
  const header = records[0];
  if (header.length !== expectedHeader.length || header.some((value, index) => value !== expectedHeader[index])) {
    fail(`${relative}: header does not match the published schema`);
  }
  return records.slice(1).map((values, rowIndex) => {
    if (values.length !== header.length) fail(`${relative}:${rowIndex + 2}: expected ${header.length} fields, found ${values.length}`);
    return Object.fromEntries(header.map((name, index) => [name, values[index] ?? '']));
  });
}

function resolvePublishedPath(relative, context) {
  if (!relative || path.isAbsolute(relative)) {
    fail(`${context}: path must be a non-empty relative path`);
    return null;
  }
  const absolute = path.resolve(exampleRoot, relative);
  const prefix = `${exampleRoot}${path.sep}`;
  if (!absolute.startsWith(prefix)) {
    fail(`${context}: path escapes the example root: ${relative}`);
    return null;
  }
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    fail(`${context}: referenced file does not exist: ${relative}`);
    return null;
  }
  return absolute;
}

function requireUnique(rows, column, relative, { allowBlank = false } = {}) {
  const seen = new Set();
  for (const [index, row] of rows.entries()) {
    const value = row[column];
    if (!value && !allowBlank) fail(`${relative}:${index + 2}: ${column} is required`);
    if (!value) continue;
    if (seen.has(value)) fail(`${relative}:${index + 2}: duplicate ${column}: ${value}`);
    seen.add(value);
  }
  return seen;
}

for (const relative of requiredMarkdown) {
  const absolute = path.join(exampleRoot, relative);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || fs.statSync(absolute).size === 0) fail(`missing or empty ${relative}`);
}

const tables = Object.fromEntries([...schemas.keys()].map((relative) => [relative, readTable(relative)]));
const captureRows = tables['input/capture-plan.csv'];
const screenshotRows = tables['indexes/screenshot_index.csv'];
const interfaceRows = tables['indexes/interface_index.csv'];
const controlRows = tables['indexes/control_coverage.csv'];
const gapRows = tables['indexes/coverage_gaps.csv'];
const capabilityRows = tables['analysis/capability-matrix.csv'];
const systemRows = tables['analysis/system-interface-evidence.csv'];

const plannedIds = requireUnique(captureRows, 'Evidence ID', 'input/capture-plan.csv');
const screenshotIds = requireUnique(screenshotRows, 'Evidence ID', 'indexes/screenshot_index.csv');
const interfaceIds = requireUnique(interfaceRows, 'Evidence ID', 'indexes/interface_index.csv');
requireUnique(capabilityRows, 'Capability ID', 'analysis/capability-matrix.csv');

if (plannedIds.size === 0) fail('input/capture-plan.csv: at least one evidence row is required');
for (const id of plannedIds) {
  if (!screenshotIds.has(id)) fail(`indexes/screenshot_index.csv: missing planned evidence ${id}`);
  if (!interfaceIds.has(id)) fail(`indexes/interface_index.csv: missing planned evidence ${id}`);
  if (!controlRows.some((row) => row['Evidence ID'] === id)) fail(`indexes/control_coverage.csv: no controls recorded for ${id}`);
  if (!gapRows.some((row) => row['Evidence ID'] === id && row['Gap type'] === 'source-artifact-not-created')) fail(`indexes/coverage_gaps.csv: ${id} must disclose source-artifact-not-created`);
}
for (const id of new Set([...screenshotIds, ...interfaceIds, ...controlRows.map((row) => row['Evidence ID']).filter(Boolean)])) {
  if (!plannedIds.has(id)) fail(`unplanned evidence ID referenced by an index: ${id}`);
}

const summariesDirectory = path.join(exampleRoot, 'evidence/screen-summaries');
const summaryFiles = fs.existsSync(summariesDirectory)
  ? fs.readdirSync(summariesDirectory).filter((name) => name.endsWith('.md')).sort()
  : [];
if (summaryFiles.length !== screenshotRows.length) fail(`evidence/screen-summaries: expected ${screenshotRows.length} summaries, found ${summaryFiles.length}`);

const screenshotById = new Map();
for (const [index, row] of screenshotRows.entries()) {
  const context = `indexes/screenshot_index.csv:${index + 2}`;
  const absolute = resolvePublishedPath(row['Screenshot path'], context);
  screenshotById.set(row['Evidence ID'], row);
  if (!absolute) continue;
  const bytes = fs.readFileSync(absolute);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (row['SHA-256'] !== digest) fail(`${context}: SHA-256 mismatch for ${row['Screenshot path']}`);
  if (row.Bytes !== String(bytes.length)) fail(`${context}: byte count mismatch for ${row['Screenshot path']}`);
  if (row.File !== path.basename(row['Screenshot path'])) fail(`${context}: File must match the referenced summary basename`);
  if (row.Format !== 'TEXT-SUMMARY') fail(`${context}: public example format must be TEXT-SUMMARY`);
  if (row.Width || row.Height) fail(`${context}: text summaries must not claim pixel dimensions`);
  if (row['UI tree path']) fail(`${context}: public example must not reference a UI tree`);
  if (row['UI tree status'] !== 'omitted') fail(`${context}: UI tree status must be omitted`);
}

for (const [index, row] of interfaceRows.entries()) {
  const context = `indexes/interface_index.csv:${index + 2}`;
  const screenshot = screenshotById.get(row['Evidence ID']);
  if (screenshot && (row.File !== screenshot.File || row.Slug !== screenshot.Slug || row['Screenshot path'] !== screenshot['Screenshot path'])) {
    fail(`${context}: file, slug, and screenshot path must match screenshot_index.csv`);
  }
  resolvePublishedPath(row['Screenshot path'], context);
  if (row['UI tree path'] || row['UI tree status'] !== 'omitted') fail(`${context}: UI tree must be empty and marked omitted`);
}

for (const [index, row] of controlRows.entries()) {
  const context = `indexes/control_coverage.csv:${index + 2}`;
  const screenshot = screenshotById.get(row['Evidence ID']);
  if (screenshot && (row.Screenshot !== screenshot.File || row.Slug !== screenshot.Slug)) fail(`${context}: screenshot and slug must match screenshot_index.csv`);
  if (row.Class !== 'SYNTHETIC-CONTROL') fail(`${context}: class must disclose SYNTHETIC-CONTROL`);
  if (row['UI tree status'] !== 'omitted') fail(`${context}: UI tree status must be omitted`);
}

for (const [index, row] of gapRows.entries()) {
  const context = `indexes/coverage_gaps.csv:${index + 2}`;
  if (!row.File || !row['Gap type'] || !row['Recommended handling']) fail(`${context}: file, gap type, and recommended handling are required`);
  if (row['Evidence ID']) {
    if (!plannedIds.has(row['Evidence ID'])) fail(`${context}: unknown evidence ID ${row['Evidence ID']}`);
    const screenshot = screenshotById.get(row['Evidence ID']);
    if (screenshot && row.File !== screenshot.File) fail(`${context}: File must match screenshot_index.csv for ${row['Evidence ID']}`);
  } else {
    resolvePublishedPath(row.File, context);
  }
}

for (const [index, row] of capabilityRows.entries()) {
  const context = `analysis/capability-matrix.csv:${index + 2}`;
  for (const id of row['Evidence IDs'].split('|').map((value) => value.trim()).filter(Boolean)) {
    if (!plannedIds.has(id)) fail(`${context}: unknown evidence ID ${id}`);
  }
  if (!row.Capability || !row.Status || !row.Limitation) fail(`${context}: capability, status, and limitation are required`);
}

for (const [index, row] of systemRows.entries()) {
  const context = `analysis/system-interface-evidence.csv:${index + 2}`;
  resolvePublishedPath(row['Evidence path'], context);
  if (!row.Module || !row.Status || !row['Directly proven'] || !row['Not proven']) fail(`${context}: module, status, directly proven, and not proven are required`);
}

for (const relative of ['reports/final-report.md', 'reports/final-report.en.md']) {
  const absolute = path.join(exampleRoot, relative);
  if (!fs.existsSync(absolute)) continue;
  const report = fs.readFileSync(absolute, 'utf8');
  for (const id of plannedIds) if (!report.includes(id)) fail(`${relative}: does not reference ${id}`);
  if (!report.includes('system-interface-evidence.csv')) fail(`${relative}: does not reference system-interface-evidence.csv`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  console.error(`example_validation=failed errors=${errors.length}`);
  process.exit(1);
}

console.log(`example_validation=passed evidence=${plannedIds.size} summaries=${summaryFiles.length} controls=${controlRows.length} gaps=${gapRows.length} capabilities=${capabilityRows.length} system_interfaces=${systemRows.length}`);
