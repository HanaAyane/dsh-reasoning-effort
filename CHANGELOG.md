# Changelog

All notable changes to this project are documented in this file.

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
