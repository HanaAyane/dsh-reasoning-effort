# Changelog

All notable changes to this project are documented in this file.

## [0.6.0] - 2026-08-16

### Added

- Host half with a built-in knowledge base (glm-5.2, kimi-k3) plus user-extensible entries under the `dsh-reasoning-effort` settings namespace.
- Read-only reasoning-effort guidance: for models the user declares in `llm-pi-ai` settings whose directory levels are missing (or disagree with the knowledge base), the composer menu offers a panel with the suggested levels and a copy-ready complete-entry YAML (including the `- id:` line; existing `name`/`contextWindow`/`maxTokens` are preserved) plus the settings.yaml path and hot-reload notes.
- Endpoint-level caveats: gateways whose OpenAI-compatible endpoint rejects the `developer` message role (e.g. Aliyun Bailian `maas/dashscope.aliyuncs.com`) get an explicit warning, since settings.yaml cannot override that behavior.
- Loopback-only Client→Host RPC channel (`/dsh-reasoning-effort`) for `diagnose`.

### Design guarantees

- The plugin never writes settings and never invents levels: built-in catalog data — including deliberately sparse level sets — is trusted as-is and never flagged; users paste declarations themselves and DSH validates them as usual.
- The Host row declares `settings`/`llm` injections so it never races the base-bundle boot order; the RPC channel mounts only on Web profiles through `ctx.inject(['connection'])`.
- Malformed user knowledge-base entries are ignored instead of breaking diagnosis; every RPC endpoint answers a structured error instead of leaking exceptions.

### Fixed

- Build pipeline split: `tsc` now only emits the Host half and client type declarations; the browser bundle is produced exclusively by esbuild plus the module-loader wrap, so a bare `tsc` run can no longer overwrite `lib/client/index.js`.

## [0.5.0] - 2026-08-16

### Changed

- Derive slider levels from the model's advertised `reasoning.efforts` instead of requiring exactly `off` / `high` / `max`, so any model with two or more levels gets a working slider (e.g. GLM coding models).
- Show adapter-provided level names (`Low` / `High` / `Xhigh`…); models without levels now read "默认" on the seat instead of a hardcoded middle level.
- Key the peak-intensity track/knob effects off the topmost level (`data-top`) rather than a hardcoded `max` effort id.
- Hide the slider when the model exposes fewer than two levels, with the menu explaining that none are provided.
- Split the stylesheet into `src/client/styles.ts`.
- Document how to declare `reasoningEfforts` + `compat` for models missing from the pi-ai catalog (README, both languages).

## [0.4.0] - 2026-08-15

### Added

- Optional eight-frame chibi runner thumb, disabled by default.
- Dedicated persistent switch under General Settings.
- Transparent, tightly packed sprite assets with top-row then bottom-row playback order.

### Changed

- Replace the initial runner frames with the refined transparent run cycle.
- Increase animation speed from 720 ms to 420 ms while dragging.
- Keep the character fully visible at both slider endpoints by applying a thumb-only inset.
- Preserve the original white thumb whenever the Big Fat Fish option is disabled.

## [0.3.0] - 2026-08-15

### Added

- Combined model and reasoning-effort control for the DSH composer.
- Three snapping levels: `off`, `high`, and `max`.
- Dark blue-violet-black and light blue-white visual themes.
- Left-clipped waves, shock pulses, pixel radiation, particles, and trails.
- Persistent enable switch under General Settings, directly below Appearance.
- English and Simplified Chinese documentation.

### Fixed

- Use direct pointer-position rendering during drag to keep the thumb synchronized with the cursor.
- Add window-level pointer release fallback for reliable completion outside the track.
- Remove thumb position transitions during active dragging.
- Restrict all trailing effects to the left side of the thumb.

### Changed

- Renamed the public package from `@dsh-external/dsh-reasoning-effort` to the unscoped `dsh-reasoning-effort`.
- Migrate the legacy browser enable preference automatically.

[0.3.0]: https://github.com/HanaAyane/dsh-reasoning-effort/releases/tag/v0.3.0
