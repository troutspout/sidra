import { describe, expect, it } from 'vitest';

import { CONTENT_READY_SELECTOR, contentReadyProbeScript } from '../src/contentReady';

describe('content readiness marker', () => {
  it('uses the hydrated amp-playback-controls-play element inside the app container', () => {
    expect(CONTENT_READY_SELECTOR).toBe('[data-testid="app-container"] amp-playback-controls-play[hydrated]');
  });

  it('builds a probe script that queries the default selector when no argument is passed', () => {
    expect(contentReadyProbeScript()).toBe(
      '!!document.querySelector("[data-testid=\\"app-container\\"] amp-playback-controls-play[hydrated]")'
    );
    expect(contentReadyProbeScript()).not.toContain('amp-lcd');
    expect(contentReadyProbeScript()).not.toContain('navigation__header');
  });

  it('embeds a custom selector when one is passed', () => {
    const customSelector = '.my-custom-element[ready]';
    const script = contentReadyProbeScript(customSelector);
    expect(script).toContain(customSelector);
    expect(script).toBe(`!!document.querySelector(${JSON.stringify(customSelector)})`);
  });

  it('default selector matches CONTENT_READY_SELECTOR', () => {
    const defaultScript = contentReadyProbeScript();
    const explicitScript = contentReadyProbeScript(CONTENT_READY_SELECTOR);
    expect(defaultScript).toBe(explicitScript);
  });
});
