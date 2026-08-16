# Changelog

All notable changes to this project are documented in this file.

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
