#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? '.');
const required = [
  'SKILL.md','README.md','LICENSE','VERSION','CHANGELOG.md','docs/THREAT_MODEL.md','docs/THREAT_MODEL.zh-CN.md',
  'references/evidence-model.md','references/analysis-guide.md',
  'templates/capability-matrix.csv','templates/system-interface-evidence.csv','templates/report-template.md',
  'scripts/init_case.sh','scripts/capture_evidence.sh','scripts/scroll_sweep.sh','scripts/ui_pick.py','scripts/tap_ui.sh',
  'scripts/build_indexes.mjs','scripts/redact_check.mjs','scripts/validate_example.mjs','scripts/validate_skill.mjs','scripts/smoke_test.sh','scripts/package_release.py',
  'tests/security_negative_test.sh',
];
const errors = [];
const maximumPublishableFileBytes = 5 * 1024 * 1024;
for (const relative of required) if (!fs.existsSync(path.join(root, relative))) errors.push(`missing ${relative}`);

const skillPath = path.join(root, 'SKILL.md');
if (fs.existsSync(skillPath)) {
  const text = fs.readFileSync(skillPath, 'utf8');
  const lines = text.split(/\r?\n/);
  if (lines.length > 100) errors.push(`SKILL.md has ${lines.length} lines; maximum is 100`);
  if (!/^---\nname: android-app-blackbox-competitive-analysis\ndescription: .+\n---\n/s.test(text)) errors.push('SKILL.md frontmatter is invalid');
  if (!/Use when /i.test(text.split('---')[1] ?? '')) errors.push('description does not include trigger wording');
}

const forbiddenBinaryExtensions = new Set([
  '.apk','.aab','.apks','.jks','.keystore','.p12','.pfx','.pem','.key',
  '.png','.jpg','.jpeg','.webp','.xlsx','.zip','.7z','.tar','.gz',
]);
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(directory, entry.name);
    const relative = path.relative(root, full);
    if (entry.isSymbolicLink()) {
      errors.push(`publishable package contains symlink: ${relative}`);
    } else if (entry.isDirectory()) {
      walk(full);
    } else {
      if (forbiddenBinaryExtensions.has(path.extname(entry.name).toLowerCase())) errors.push(`publishable package contains forbidden artifact: ${relative}`);
      if (fs.statSync(full).size > maximumPublishableFileBytes) errors.push(`publishable file exceeds 5 MiB limit: ${relative}`);
    }
  }
}
walk(root);

if (errors.length) {
  for (const error of errors) console.error(error);
  console.error(`skill_validation=failed errors=${errors.length}`);
  process.exit(1);
}
console.log(`skill_validation=passed files=${required.length}`);
