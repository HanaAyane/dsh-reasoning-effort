/**
 * Host loader entry for the browser implementation exported from `./client`.
 *
 * This plugin is client-only: the whole capability lives in the composer
 * (rendering the slider and updating the current session through
 * `connection.api.sessions`), so the Host half has no behavior.
 * Keeping this file makes the package a valid Cordis plugin row; the loader
 * resolves the browser half through the `./client` export plus the
 * `dsh.client` block in package.json.
 *
 * @module dsh-reasoning-effort
 */

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function apply(): void {}
