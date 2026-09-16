# Personal docs

These notes are for the personal Quantumult X parsers in this repository. They are not company, employer, or client documentation.

| Page | What it covers |
| --- | --- |
| [Personal scope](personal-scope.md) | What belongs here, and what must never be committed |
| [Nexitally workflow](nexitally-workflow.md) | Why a full-config download is the wrong refresh path |
| [Parser specification](parser-specification.md) | Exact keep / drop / section rules for `nexitally-node-parser.js` |
| [Quantumult X runtime](quantumult-x-runtime.md) | `$resource` / `$done` contract used by the script |
| [Device setup](device-setup.md) | Wiring the parser into a local profile |
| [Line atlas](line-atlas.md) | Supported server-line shapes and metadata traps |
| [Troubleshooting](troubleshooting.md) | Common refresh failures |
| [Adding another personal parser](adding-a-personal-parser.md) | Checklist if a second provider ever needs the same treatment |
| [中文速查](zh-速查.md) | Short Chinese index of the same material |

Sanitized fixtures that exercise the specification live under [`examples/atlas/`](../examples/atlas/). Run them with:

```bash
npm test
```
