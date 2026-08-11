#!/usr/bin/env python3
"""Build a deterministic installable zip and SHA-256 file from repository files."""

import argparse
import hashlib
import os
import re
import stat
import subprocess
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
EXCLUDED_PREFIXES = (".git/", ".github/", "dist/")


def repository_files():
    output = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
        cwd=ROOT,
        text=True,
    )
    for relative in sorted(set(output.splitlines())):
        if not relative or relative.startswith(EXCLUDED_PREFIXES):
            continue
        source = ROOT / relative
        if source.is_symlink():
            raise SystemExit(f"refusing symlink in release payload: {relative}")
        if source.is_file():
            yield relative, source


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--version", default=(ROOT / "VERSION").read_text().strip())
    parser.add_argument("--output-dir", default=str(ROOT / "dist"))
    args = parser.parse_args()

    version = args.version.removeprefix("v")
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise SystemExit("version must use semantic form X.Y.Z or vX.Y.Z")
    if version != (ROOT / "VERSION").read_text().strip():
        raise SystemExit("requested version does not match VERSION")

    subprocess.run(["node", "scripts/validate_skill.mjs", "."], cwd=ROOT, check=True)
    subprocess.run(["node", "scripts/redact_check.mjs", "."], cwd=ROOT, check=True)

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    archive = output_dir / f"android-blackbox-analysis-skill-v{version}.zip"
    prefix = f"android-blackbox-analysis-skill-v{version}"
    fixed_time = (2026, 1, 1, 0, 0, 0)

    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
        for relative, source in repository_files():
            info = zipfile.ZipInfo(f"{prefix}/{relative}", fixed_time)
            executable = bool(source.stat().st_mode & stat.S_IXUSR)
            info.external_attr = ((0o755 if executable else 0o644) & 0xFFFF) << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            bundle.writestr(info, source.read_bytes())

    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    checksum = archive.with_suffix(archive.suffix + ".sha256")
    checksum.write_text(f"{digest}  {archive.name}\n", encoding="utf-8")
    print(f"archive={archive}")
    print(f"sha256={digest}")
    print(f"checksum={checksum}")


if __name__ == "__main__":
    main()
