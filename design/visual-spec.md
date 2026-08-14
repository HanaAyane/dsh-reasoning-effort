# Reasoning effort visual baseline

Approved on 2026-08-15 for the DeepSeek Harness integration.

## Interaction

- Exactly three values: `off`, `high`, `max`.
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

- Replace the compact `conversation.input.model` seat with one model + effort trigger.
- The popover shows the effort slider directly above the current-model row, without a separate heading or decorative icon; the row drills into the provider-grouped model list.
- Follow DSH's actual theme marker: `body[data-ds-dark-theme]`.
- Prefer DSH `--dsw-*` design tokens for surrounding labels, borders, and focus treatment.
- Read and write `reasoningEffort` through the current session's model selection (`sessions.models` / `sessions.selectModel`), never through the global provider settings namespace.

## Experimental chibi thumb

- Disabled by default and controlled by a separate switch below the main plugin switch.
- Replace only the white thumb; keep the approved track, radiation, snapping, and model-selection behavior.
- Play eight frames in reading order: top row left-to-right, then bottom row left-to-right.
- Use a 720 ms loop at rest and a 420 ms loop while dragging.
- Keep the full character visible at both track endpoints and preserve reduced-motion behavior by freezing the animation.
