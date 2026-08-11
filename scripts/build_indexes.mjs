#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--case-root') args.caseRoot = argv[++i];
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  if (!args.caseRoot) throw new Error('usage: build_indexes.mjs --case-root DIR');
  return args;
}

function csv(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function writeCsv(file, headers, rows) {
  const content = [headers, ...rows].map(row => row.map(csv).join(',')).join('\n');
  fs.writeFileSync(file, `\uFEFF${content}\n`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function imageInfo(file) {
  const data = fs.readFileSync(file);
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && data.length >= 24) {
    return ['PNG', data.readUInt32BE(16), data.readUInt32BE(20)];
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 <= data.length) {
      if (data[offset] !== 0xff) { offset++; continue; }
      const marker = data[offset + 1];
      offset += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      if (offset + 2 > data.length) break;
      const length = data.readUInt16BE(offset);
      if (marker >= 0xc0 && marker <= 0xc3 && offset + 7 < data.length) {
        return ['JPEG', data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3)];
      }
      offset += Math.max(length, 2);
    }
  }
  return ['UNKNOWN', '', ''];
}

function decodeXml(text) {
  return text
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}

function parseNodes(xmlText) {
  const nodes = [];
  for (const match of xmlText.matchAll(/<node\b([^>]*)>/g)) {
    const attrs = {};
    for (const attr of match[1].matchAll(/([\w:-]+)="([^"]*)"/g)) attrs[attr[1]] = decodeXml(attr[2]);
    nodes.push(attrs);
  }
  return nodes;
}

function center(bounds = '') {
  const match = bounds.match(/^\[(\d+),(\d+)\]\[(\d+),(\d+)\]$/);
  if (!match) return ['', ''];
  return [Math.round((Number(match[1]) + Number(match[3])) / 2), Math.round((Number(match[2]) + Number(match[4])) / 2)];
}

const { caseRoot } = parseArgs(process.argv.slice(2));
const root = path.resolve(caseRoot);
const shotsDir = path.join(root, 'evidence', 'screenshots');
const treesDir = path.join(root, 'evidence', 'ui_tree');
const outDir = path.join(root, 'indexes');
fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(shotsDir)) throw new Error(`missing screenshots directory: ${shotsDir}`);

const imageFiles = fs.readdirSync(shotsDir).filter(name => /\.(png|jpe?g)$/i.test(name)).sort();
const screenshotRows = [];
const interfaceRows = [];
const controlRows = [];
const gapRows = [];
const seenIds = new Map();

for (const name of imageFiles) {
  const match = name.match(/^([A-Za-z0-9][A-Za-z0-9.-]*)_(.+)\.(png|jpe?g)$/i);
  if (!match) {
    gapRows.push(['', name, 'invalid-filename', 'Expected <ID>_<slug>.<png|jpg>']);
    continue;
  }
  const [, id, slug] = match;
  const shot = path.join(shotsDir, name);
  const base = name.replace(/\.(png|jpe?g)$/i, '');
  const completeXml = path.join(treesDir, `${base}.xml`);
  const incompleteXml = path.join(treesDir, `${base}.incomplete.xml`);
  const xml = fs.existsSync(completeXml) ? completeXml : (fs.existsSync(incompleteXml) ? incompleteXml : '');
  const uiStatus = xml ? (xml.endsWith('.incomplete.xml') ? 'incomplete' : 'complete') : 'missing';
  const [format, width, height] = imageInfo(shot);
  const relativeShot = path.relative(root, shot);
  const relativeXml = xml ? path.relative(root, xml) : '';
  const duplicate = seenIds.has(id) ? `duplicate ID; first seen in ${seenIds.get(id)}` : '';
  if (!seenIds.has(id)) seenIds.set(id, name);
  screenshotRows.push([id, name, slug, relativeShot, sha256(shot), format, width, height, fs.statSync(shot).size, relativeXml, uiStatus, duplicate]);
  if (format === 'UNKNOWN') gapRows.push([id, name, 'invalid-image', 'Unsupported or corrupt image']);
  if (uiStatus !== 'complete') gapRows.push([id, name, `ui-tree-${uiStatus}`, 'Screenshot remains valid; UI coverage is partial']);
  if (duplicate) gapRows.push([id, name, 'duplicate-id', duplicate]);

  let nodes = [];
  if (xml) {
    const xmlText = fs.readFileSync(xml, 'utf8');
    nodes = parseNodes(xmlText);
  }
  const visibleTexts = [];
  const controls = [];
  for (const attrs of nodes) {
    for (const value of [attrs.text, attrs['content-desc']]) {
      const cleaned = String(value ?? '').replace(/\s+/g, ' ').trim();
      if (cleaned && !visibleTexts.includes(cleaned)) visibleTexts.push(cleaned);
    }
    const className = attrs.class ?? '';
    const actionable = attrs.clickable === 'true' || attrs['long-clickable'] === 'true' || attrs.checkable === 'true' || /Button|Switch|EditText|CheckBox/.test(className);
    if (!actionable) continue;
    const label = attrs.text || attrs['content-desc'] || attrs['resource-id'] || className;
    if (label && !controls.includes(label)) controls.push(label);
    const [x, y] = center(attrs.bounds);
    controlRows.push([
      id, name, slug, className, attrs['resource-id'] ?? '', attrs.text ?? '', attrs['content-desc'] ?? '',
      attrs.clickable ?? '', attrs['long-clickable'] ?? '', attrs.checkable ?? '', attrs.checked ?? '',
      attrs.enabled ?? '', attrs.selected ?? '', attrs.bounds ?? '', x, y, uiStatus,
    ]);
  }
  interfaceRows.push([id, name, slug, visibleTexts.join(' | '), controls.join(' | '), relativeShot, relativeXml, uiStatus]);
}

writeCsv(path.join(outDir, 'screenshot_index.csv'), [
  'Evidence ID','File','Slug','Screenshot path','SHA-256','Format','Width','Height','Bytes','UI tree path','UI tree status','Notes',
], screenshotRows);
writeCsv(path.join(outDir, 'interface_index.csv'), [
  'Evidence ID','File','Slug','Visible text and descriptions','Actionable control summary','Screenshot path','UI tree path','UI tree status',
], interfaceRows);
writeCsv(path.join(outDir, 'control_coverage.csv'), [
  'Evidence ID','Screenshot','Slug','Class','Resource ID','Text','Content description','Clickable','Long-clickable','Checkable','Checked','Enabled','Selected','Bounds','Center X','Center Y','UI tree status',
], controlRows);
writeCsv(path.join(outDir, 'coverage_gaps.csv'), ['Evidence ID','File','Gap type','Recommended handling'], gapRows);

console.log(JSON.stringify({ screenshots: screenshotRows.length, interfaces: interfaceRows.length, controls: controlRows.length, gaps: gapRows.length, output: outDir }, null, 2));
