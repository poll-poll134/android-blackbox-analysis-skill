#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const root = path.resolve(argv[0] && !argv[0].startsWith('--') ? argv.shift() : '.');
const deny = [];
while (argv.length) {
  const flag = argv.shift();
  if (flag === '--deny') deny.push(argv.shift() ?? '');
  else throw new Error(`unknown argument: ${flag}`);
}

const allowedExtensions = new Set(['.md','.sh','.mjs','.js','.py','.csv','.json','.yaml','.yml','.toml','.txt','.gitignore']);
const skippedDirs = new Set(['.git','node_modules','cases','dist']);
const findings = [];
const maximumTextFileBytes = 5 * 1024 * 1024;

const patterns = [
  ['macOS user path', new RegExp('/' + 'Users/[^/\\s]+/', 'g')],
  ['Linux user path', new RegExp('/' + 'home/[^/\\s]+/', 'g')],
  ['Windows user path', /[A-Za-z]:\\Users\\[^\\\s]+\\/g],
  ['private IPv4 address', /\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g],
  ['email address', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
  ['secret assignment', /\b(?:api[_-]?key|access[_-]?token|secret|password)\s*[:=]\s*["']?[^\s"']{8,}/gi],
  ['private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['ANSI escape sequence', /\x1b\[[0-?]*[ -\/]*[@-~]/g],
  ['non-example Android package', /\b(?:com|org|io|net)\.(?!example\b)[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*){1,}\b/g],
];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skippedDirs.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) findings.push({ file: path.relative(root, full), line: 0, label: 'symlink in publishable tree' });
    else if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) scan(full);
  }
}

function scan(file) {
  const ext = path.extname(file);
  if (!allowedExtensions.has(ext) && path.basename(file) !== '.gitignore' && path.basename(file) !== 'LICENSE') return;
  if (fs.statSync(file).size > maximumTextFileBytes) {
    findings.push({ file: path.relative(root, file), line: 0, label: 'text file exceeds 5 MiB scan limit' });
    return;
  }
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    for (const [label, pattern] of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(lines[i])) findings.push({ file: path.relative(root, file), line: i + 1, label });
    }
    for (const token of deny.filter(Boolean)) {
      if (lines[i].toLowerCase().includes(token.toLowerCase())) findings.push({ file: path.relative(root, file), line: i + 1, label: `denied token: ${token}` });
    }
  }
}

walk(root);
if (findings.length) {
  for (const finding of findings) console.error(`${finding.file}:${finding.line}: ${finding.label}`);
  console.error(`redaction_status=failed findings=${findings.length}`);
  process.exit(1);
}
console.log('redaction_status=passed');
