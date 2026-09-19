export type Page = 'home' | 'app' | 'educators';

export const IS_ARTIFACT = import.meta.env.VITE_TARGET === 'artifact';

/**
 * Links between the three surfaces. The static site uses sibling folders with a
 * relative base, so links work from a domain root or a project subpath; the
 * single-file artifact build uses hash routes instead.
 */
export function href(to: Page, from: Page): string {
  if (IS_ARTIFACT) return to === 'home' ? '#/' : `#/${to}`;
  const up = from === 'home' ? './' : '../';
  return to === 'home' ? up : `${up}${to}/`;
}
