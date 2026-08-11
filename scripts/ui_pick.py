#!/usr/bin/env python3
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: ui_pick.py <ui_dump.xml> <exact-text-desc-or-resource-id>")
    xml_path = Path(sys.argv[1])
    if xml_path.is_symlink():
        raise SystemExit("refusing symlinked UI dump")
    if xml_path.stat().st_size > 10 * 1024 * 1024:
        raise SystemExit("UI dump exceeds 10 MiB safety limit")
    xml_text = xml_path.read_text(encoding="utf-8", errors="replace")
    marker = "</hierarchy>"
    start = xml_text.find("<hierarchy")
    end = xml_text.rfind(marker)
    if start == -1 or end == -1:
        raise SystemExit("complete hierarchy not found")
    root = ET.fromstring(xml_text[start:end + len(marker)])
    selector = clean(sys.argv[2])
    for element in root.iter():
        values = {
            "text": clean(element.attrib.get("text")),
            "content-desc": clean(element.attrib.get("content-desc")),
            "resource-id": clean(element.attrib.get("resource-id")),
        }
        matched = None
        for key, value in values.items():
            if value == selector or (key == "resource-id" and (value.endswith(":id/" + selector) or value.endswith("/" + selector))):
                matched = (key, value)
                break
        if not matched:
            continue
        bounds = element.attrib.get("bounds", "")
        parsed = re.fullmatch(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", bounds)
        if not parsed:
            raise SystemExit("matching node has invalid bounds")
        x1, y1, x2, y2 = map(int, parsed.groups())
        print(f"{(x1 + x2) // 2} {(y1 + y2) // 2}")
        print(f"matched={matched[0]}:{matched[1]}", file=sys.stderr)
        print(f"bounds={bounds}", file=sys.stderr)
        return
    raise SystemExit("node not found")


if __name__ == "__main__":
    main()
