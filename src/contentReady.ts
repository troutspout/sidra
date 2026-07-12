// Hash-immune handles: Apple's data test id on the app container and the amp-* custom element tag survive class hashing.
// The Stencil hydrated attribute on the playback control marks the first render, so JS has executed and chrome is interactive.
export const CONTENT_READY_SELECTOR = '[data-testid="app-container"] amp-playback-controls-play[hydrated]';

export function contentReadyProbeScript(selector: string = CONTENT_READY_SELECTOR): string {
  return `!!document.querySelector(${JSON.stringify(selector)})`;
}
