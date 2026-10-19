# Reasoning effort visual baseline

Approved on 2026-08-15 for the DeepSeek Harness integration.

## Interaction

- Level count, names and order come from the current model directory; there is no fixed three-level set.
- The thumb follows the pointer continuously and snaps to a value on release.
- Radiation, waves, crests, particles, and the trailing flare are clipped to the left side of the thumb.
- No rotating animation.
- The thumb fill is pure white in every theme.

## Dark theme

- Blue, violet, and near-black track.
- Pixel radiation uses electric blue through violet highlights.
- `max` may increase bloom and pulse intensity without rotating the thumb.

## Light theme

- White and blue track.
- The filled region ends at the thumb; the unfilled region stays pale blue-white.
- `high` ends in a medium blue and `max` ends in a visibly deeper blue.
- Radiation remains blue and readable on a light surface.

## DSH adaptation

- Reuse the native model selector and connect the plugin slider to its Effort entry. Keep native search, groups, badges and trigger typography.
- The effort pane has no Back button: show the slider, one dot per level and the current name. Keep it open after adjustment; Esc returns and outside clicks dismiss.
- Follow DSH's actual theme marker: `body[data-ds-dark-theme]`.
- Prefer DSH `--dsw-*` design tokens for surrounding labels, borders, and focus treatment.
- Read and write `reasoningEffort` through the current session's model selection (`sessions.models` / `sessions.selectModel`), never through the global provider settings namespace.

## Experimental chibi thumb

- Enabled by default and controlled by a separate switch below the main plugin switch.
- Replace only the white thumb; keep the approved track, radiation, snapping, and model-selection behavior.
- Play eight frames in reading order: top row left-to-right, then bottom row left-to-right.
- Use a 720 ms loop at rest and a 420 ms loop while dragging.
- Keep the full character visible at both track endpoints and preserve reduced-motion behavior by freezing the animation.

## README artwork refresh (v0.9.0)

- Audience: DSH Web and Desktop users choosing models and reasoning levels.
- Value: native model selection with a focused effort slider.
- First action: model trigger → Effort → drag and release.
- Proof: maintainer-provided dark and light DSH screenshots, embedded without redrawing their UI.
- Palette: near-black #070A14, blue #5D83FF, violet #A66BFF, white #F7F9FF, muted #AEBBE1.
- Typography: Segoe UI / system sans, large two-line hero title, supporting UI labels.
- Shape: rounded panels, quiet grid, blue/violet accent bar, generous outer margins.
- Motif: existing Big Fat Fish artwork, segmented levels and left-filled track.
- Sources: assets/readme/source/hero-layout.svg and themes-layout.svg plus existing hero-subject.png and maintainer-provided dsh-dark-popup.png / dsh-light-popup.png. Export WebP for README embedding.
- Screenshots preserve the actual model, badge, slider and level labels. Actual levels remain model-defined. Both source screenshots are kept unchanged.
