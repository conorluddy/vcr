"""Copy the arm64 Vamp plugin libraries named on the command line out of the Vamp Plugin Pack installer binary.

The installer carries each plugin library as an embedded Mach-O image, and each library's Turtle description (`<stem>.n3`,
which sonic-annotator needs for the rdf and jams writers) as plain text. This script reads the image's load commands to find
its install name and size, then writes the arm64 slice and its description to the output directory. It does not run the installer.

Usage: python3 -I extract-vamp-plugins.py <installer-binary> <output-dir> <install-name> [<install-name> ...]
"""

import os
import re
import struct
import sys

MACH_O_64_MAGIC = b"\xcf\xfa\xed\xfe"
MACH_O_DYLIB_FILE_TYPE = 6
CPU_TYPE_ARM64 = 0x0100000C
LC_SEGMENT_64 = 0x19
LC_ID_DYLIB = 0xD
MACH_O_HEADER_BYTES = 32


def readInstallName(data: bytes, commandsStart: int, commandCount: int) -> str:
    position = commandsStart
    for _ in range(commandCount):
        command, commandSize = struct.unpack_from("<II", data, position)
        if command == LC_ID_DYLIB:
            nameOffset = struct.unpack_from("<I", data, position + 8)[0]
            return data[position + nameOffset : position + commandSize].split(b"\x00")[0].decode()
        position += commandSize
    return ""


def imageSizeBytes(data: bytes, commandsStart: int, commandCount: int) -> int:
    size = 0
    position = commandsStart
    for _ in range(commandCount):
        command, commandSize = struct.unpack_from("<II", data, position)
        if command == LC_SEGMENT_64:
            fileOffset, fileSize = struct.unpack_from("<QQ", data, position + 40)
            size = max(size, fileOffset + fileSize)
        position += commandSize
    return size


def findArm64DylibImages(data: bytes) -> dict[str, bytes]:
    images: dict[str, bytes] = {}
    searchOffset = 0
    while True:
        start = data.find(MACH_O_64_MAGIC, searchOffset)
        if start < 0:
            return images
        searchOffset = start + 4
        cpuType, _, fileType, commandCount = struct.unpack_from("<iiII", data, start + 4)
        if fileType != MACH_O_DYLIB_FILE_TYPE or cpuType != CPU_TYPE_ARM64 or commandCount >= 500:
            continue
        commandsStart = start + MACH_O_HEADER_BYTES
        installName = readInstallName(data, commandsStart, commandCount)
        if installName and installName not in images:
            size = imageSizeBytes(data, commandsStart, commandCount)
            images[installName] = data[start : start + size]


def findPluginDescriptions(data: bytes) -> dict[str, bytes]:
    # Each library's Turtle description is embedded as plain text starting "@prefix owl:". Its primary topic names the library.
    descriptions: dict[str, bytes] = {}
    for match in re.finditer(rb"@prefix owl:", data):
        end = match.start()
        while end < len(data) and (32 <= data[end] < 127 or data[end] in (9, 10, 13)):
            end += 1
        block = data[match.start() : end]
        topic = re.search(rb"primaryTopic\s+<http://vamp-plugins\.org/rdf/plugins/([^>]+)>", block)
        if topic and topic.group(1) not in descriptions:
            # The embedded blocks omit the vamp: and plugbase: prefix declarations that the description uses; restore them.
            pluginName = topic.group(1).decode()
            prefixes = b""
            if b"@prefix vamp:" not in block:
                prefixes += b"@prefix vamp: <http://purl.org/ontology/vamp/> .\n"
            if b"@prefix plugbase:" not in block:
                prefixes += f"@prefix plugbase: <http://vamp-plugins.org/rdf/plugins/{pluginName}#> .\n".encode()
            descriptions[pluginName] = prefixes + block
    return descriptions


def main(arguments: list[str]) -> int:
    if len(arguments) < 3:
        print("usage: extract-vamp-plugins.py <installer-binary> <output-dir> <install-name>...", file=sys.stderr)
        return 2
    installerPath, outputDirectory, wantedNames = arguments[0], arguments[1], arguments[2:]
    installerData = open(installerPath, "rb").read()
    images = findArm64DylibImages(installerData)
    descriptions = findPluginDescriptions(installerData)
    os.makedirs(outputDirectory, exist_ok=True)
    for wantedName in wantedNames:
        if wantedName not in images:
            print(f"extract-vamp-plugins: no arm64 image named {wantedName} in the installer; the pack layout changed.", file=sys.stderr)
            return 1
        stem = wantedName[: -len(".dylib")]
        if stem not in descriptions:
            print(f"extract-vamp-plugins: no plugin description for {stem} in the installer; the pack layout changed.", file=sys.stderr)
            return 1
        with open(os.path.join(outputDirectory, wantedName), "wb") as handle:
            handle.write(images[wantedName])
        with open(os.path.join(outputDirectory, stem + ".n3"), "wb") as handle:
            handle.write(descriptions[stem])
        print(f"extract-vamp-plugins: wrote {wantedName} ({len(images[wantedName])} bytes) and {stem}.n3 ({len(descriptions[stem])} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
