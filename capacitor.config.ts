import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Wraps the built web app as a native iOS app.
 *
 * This is only needed for an App Store build. Installing via Safari's
 * "Add to Home Screen" needs none of this and works today -- see the README.
 *
 * The remaining steps require macOS and cannot be run from Linux or CI:
 *   npm run build && npx cap sync ios && npx cap open ios
 * then set the signing team in Xcode and archive.
 */
const config: CapacitorConfig = {
  appId: 'com.voitiuk.englishpractice',
  appName: 'Английский язык',
  webDir: 'dist',
  ios: {
    // The app ships its own light/dark handling, and the web layer draws the
    // background itself -- see the theme tokens in src/index.css.
    backgroundColor: '#faf8f4',
    // Practice works offline, so a failed network call must never show an
    // error page over a perfectly functional app.
    limitsNavigationsToAppBoundDomains: true,
  },
};

export default config;
