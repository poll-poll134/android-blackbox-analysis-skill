#!/usr/bin/env python3
import struct
import sys
from pathlib import Path


def image_info(path):
    data = Path(path).read_bytes()
    if data.startswith(b"\x89PNG\r\n\x1a\n") and len(data) >= 24:
        return "PNG", struct.unpack(">I", data[16:20])[0], struct.unpack(">I", data[20:24])[0]
    if data.startswith(b"\xff\xd8"):
        offset = 2
        while offset + 9 <= len(data):
            if data[offset] != 0xFF:
                offset += 1
                continue
            marker = data[offset + 1]
            offset += 2
            if marker in (0xD8, 0xD9):
                continue
            if offset + 2 > len(data):
                break
            length = struct.unpack(">H", data[offset:offset + 2])[0]
            if marker in range(0xC0, 0xC4) and offset + 7 < len(data):
                height = struct.unpack(">H", data[offset + 3:offset + 5])[0]
                width = struct.unpack(">H", data[offset + 5:offset + 7])[0]
                return "JPEG", width, height
            offset += max(length, 2)
    raise ValueError("unsupported or invalid image")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: image_info.py <image>")
    fmt, width, height = image_info(sys.argv[1])
    print(f"{fmt} {width} {height}")
