import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildThemeCss } from '../src/themeTemplate';
import { BUNDLED_THEMES, themeLabel } from '../src/palettes';

const styleFixCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'styleFix.css'), 'utf-8');

function mediaBlock(css: string, query: string): string {
  const start = css.indexOf(`@media (${query})`);
  expect(start).toBeGreaterThanOrEqual(0);

  const next = css.indexOf('@media (', start + 1);
  return next === -1 ? css.slice(start) : css.slice(start, next);
}

const HEX_RE = /^#[0-9a-f]{6}$/;

describe('palettes', () => {
  it('has unique kebab-case names and unique labels', () => {
    const names = BUNDLED_THEMES.map(t => t.name);
    const labels = BUNDLED_THEMES.map(t => t.label);
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(labels).size).toBe(labels.length);
    for (const name of names) {
      expect(name).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it('defines every slot as a six-digit lowercase hex colour', () => {
    for (const theme of BUNDLED_THEMES) {
      for (const scheme of [theme.dark, theme.light]) {
        for (const [slot, value] of Object.entries(scheme)) {
          expect(value, `${theme.name} ${slot}`).toMatch(HEX_RE);
        }
      }
    }
  });

  it('resolves labels for bundled, custom, and unknown names', () => {
    expect(themeLabel('catppuccin')).toBe('Catppuccin');
    expect(themeLabel('rose-pine')).toBe('Ros\u00e9 Pine');
    expect(themeLabel('custom')).toBe('Custom');
    expect(themeLabel('apple-music')).toBe('Apple Music');
    expect(themeLabel('no-such-theme')).toBe('Apple Music');
  });
});

describe('buildThemeCss', () => {
  for (const theme of BUNDLED_THEMES) {
    describe(theme.name, () => {
      const css = buildThemeCss(theme);
      const darkCss = mediaBlock(css, 'prefers-color-scheme: dark');
      const lightCss = mediaBlock(css, 'prefers-color-scheme: light');

      it('styles scrollbars in both colour-scheme variants', () => {
        for (const block of [darkCss, lightCss]) {
          expect(block).toContain('scrollbar-color:');
          expect(block).toContain('*::-webkit-scrollbar');
          expect(block).toContain('*::-webkit-scrollbar-thumb');
          expect(block).toContain('*::-webkit-scrollbar-track');
        }
      });

      it('styles footer, locale switcher, and banner in both variants', () => {
        for (const block of [darkCss, lightCss]) {
          expect(block).toContain('/* Footer */');
          expect(block).toContain('.scrollable-page footer');
          expect(block).toContain('[class*="locale-switcher"]');
          expect(block).toContain('[data-testid="banner-container"]');
        }
      });

      it('retains player variables and the accent button override', () => {
        expect(darkCss).toContain('--playerBackground:');
        expect(darkCss).toContain('--playerBGFill:');
        expect(darkCss).toContain('--keyColor:');
        expect(css).toContain('.button.primary button.click-action');
        expect(css).toContain('background-color: var(--keyColor) !important;');
      });

      it('keeps old player structural selectors out', () => {
        expect(css).not.toContain('.wrapper amp-chrome-player::before');
        expect(css).not.toContain('.player-bar');
        expect(css).not.toContain('.chrome-player.chrome-player__music');
        expect(css).not.toContain('amp-lcd');
      });

      it('keeps country/location banner control styling on Apple Music defaults', () => {
        expect(css).not.toContain('[class*="country-select"]');
        expect(css).not.toContain('[class*="country-selector"]');
        expect(css).not.toContain('[class*="location-selector"]');
        expect(css).not.toContain('[class*="storefront-selector"]');
        expect(css).not.toContain('[data-testid*="country" i]');
        expect(css).not.toContain('[aria-label*="country" i]');
        expect(css).not.toContain('[role="combobox"]');
        expect(css).not.toContain('[class*="menu"]');
        expect(css).not.toContain('[class*="continue"]');
        expect(css).not.toContain('[aria-label*="continue" i]');
        expect(css).not.toContain('[class*="close-button"]');
        expect(css).not.toContain('[aria-label*="close" i]');
      });
    });
  }
});

describe('catppuccin regression against the retired static asset', () => {
  const catppuccin = BUNDLED_THEMES.find(t => t.name === 'catppuccin')!;
  const css = buildThemeCss(catppuccin);
  const darkCss = mediaBlock(css, 'prefers-color-scheme: dark');
  const lightCss = mediaBlock(css, 'prefers-color-scheme: light');

  it('reproduces the Mocha values byte for byte', () => {
    expect(darkCss).toContain('--pageBG: #1e1e2e !important;');
    expect(darkCss).toContain('--pageBG-rgb: 30,30,46 !important;');
    expect(darkCss).toContain('--keyColor: #f38ba8 !important;');
    expect(darkCss).toContain('--keyColor-disabled: rgba(243,139,168,0.35) !important;');
    expect(darkCss).toContain('--systemPrimary: rgba(205,214,244,0.85) !important;');
    expect(darkCss).toContain('--playerBackground: rgba(24,24,37,0.88) !important;');
    expect(darkCss).toContain('--playerBGFill: rgba(24, 24, 37, 0.88) !important;');
    expect(darkCss).toContain('scrollbar-color: #45475a #181825 !important;');
    expect(darkCss).toContain('background: #11111b !important;');
    expect(darkCss).toContain('background-color: #181825 !important;');
    expect(darkCss).toContain('background-color: rgba(24, 24, 37, 0.97) !important;');
  });

  it('reproduces the Latte values byte for byte', () => {
    expect(lightCss).toContain('--pageBG: #eff1f5 !important;');
    expect(lightCss).toContain('--keyColor: #d20f39 !important;');
    expect(lightCss).toContain('--playerBackground: rgba(230,233,239,0.88) !important;');
    expect(lightCss).toContain('--playerBGFill: rgba(230, 233, 239, 0.88) !important;');
    expect(lightCss).toContain('scrollbar-color: #bcc0cc #e6e9ef !important;');
    expect(lightCss).toContain('background: #dce0e8 !important;');
    expect(lightCss).toContain('background-color: #e6e9ef !important;');
  });
});

describe('styleFix.css separation', () => {
  it('keeps scrollbar styling out of styleFix.css', () => {
    expect(styleFixCss).not.toContain('scrollbar-color');
    expect(styleFixCss).not.toContain('::-webkit-scrollbar');
  });

  it('keeps theme footer and prompt styling out of styleFix.css', () => {
    expect(styleFixCss).not.toContain('[class*="country-banner"]');
    expect(styleFixCss).not.toContain('[class*="location-banner"]');
    expect(styleFixCss).not.toContain('[class*="storefront-banner"]');
    expect(styleFixCss).not.toContain('[class*="country-selector"]');
    expect(styleFixCss).not.toContain('[data-testid*="country" i]');
    expect(styleFixCss).not.toContain('[role="dialog"]:has(select):has(button)');
  });
});
