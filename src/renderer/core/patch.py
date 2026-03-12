import sys

file_path = r"d:\userContent\Antigravity\mmd2\src\renderer\core\mmd-manager.ts"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    TrackCategory,
} from "./types";"""

replacement = """    TrackCategory,
} from "../../shared/types";"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Target not found")
