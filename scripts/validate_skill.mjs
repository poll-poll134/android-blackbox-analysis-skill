#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'SKILL.md','README.md','LICENSE',
  'references/evidence-model.md','references/analysis-guide.md',
  'templates/capability-matrix.csv','templates/system-interface-evidence.csv','templates/report-template.md',
  'scripts/init_case.sh','scripts/capture_evidence.sh','scripts/scroll_sweep.sh','scripts/ui_pick.py','scripts/tap_ui.sh',
  'scripts/build_indexes.mjs','scripts/redact_check.mjs','scripts/validate_example.mjs','scripts/validate_skill.mjs','scripts/smoke_test.sh',
];
const errors = [];
for (const relative of required) if (!fs.existsSync(path.join(root, relative))) errors.push(`missing ${relative}`);

const skillPath = path.join(root, 'SKILL.md');
if (fs.existsSync(skillPath)) {
  const text = fs.readFileSync(skillPath, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length > 100) errors.push(`SKILL.md has ${lines.length} lines; maximum is 100`);
  if (!/^---\nname: android-app-blackbox-competitive-analysis\ndescription: .+\n---\n/s.test(text)) errors.push('SKILL.md frontmatter is invalid');
  if (!/Use when /i.test(text.split('---')[1] ?? '')) errors.push('description does not include trigger wording');
}

const forbiddenBinaryExtensions = new Set(['.apk','.aab','.apks','.jks','.keystore','.png','.jpg','.jpeg','.xlsx']);
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (forbiddenBinaryExtensions.has(path.extname(entry.name).toLowerCase())) errors.push(`publishable package contains forbidden artifact: ${path.relative(root, full)}`);
  }
}
walk(root);

if (errors.length) {
  for (const error of errors) console.error(error);
  console.error(`skill_validation=failed errors=${errors.length}`);
  process.exit(1);
}
console.log(`skill_validation=passed files=${required.length}`);
