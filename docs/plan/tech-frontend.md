# Technology selection: front-end

**Status:** Draft · **Owner:** TeddyBertrand (the team confirms) · **Decision:** Solid with Capacitor, proposed ([ADR 0002](../adr/0002-frontend-solid-capacitor.md))

**Scope:** the web client and the Android client: frameworks, shared code or not, UI and i18n libraries, how the builder is drawn.

**Drives the choice** ([subject](../subject/SUBJECT.md)): separate from the server · web-only builder · Android with a configurable server address, APK built by Docker Compose · WCAG AA · two languages · OIDC and OAuth2 redirects on web and mobile.

## What we compared

- **TypeScript only** (repository rule), so Kotlin and Flutter are out; **full-stack frameworks strongly discouraged** (subject), so Next.js, SvelteKit and SolidStart are left out. Each candidate is a single-page app.
- The builder is web only; the Android client lists workflows, enables and disables them and shows what they did.
- Three candidates, written web / mobile: **React / React Native with Expo** (native UI), **Svelte / Capacitor** and **Solid / Capacitor** (the web build in a WebView). Considered, not tested: Angular with Ionic, Vue with Quasar.

## Tests made

Each candidate went through seven probes built from an identical brief, one on top of the other in the same folder, with a 5-minute cap each (10 for Android). Every probe was verified by rerunning its tests, and one rule was broken on purpose to check a test failed.

1. **F0, built and served:** a page whose API address comes from a runtime configuration file, never a literal.
2. **F1, typed client:** generated from the OpenAPI description; a call with a wrong field type must fail to compile.
3. **F2, two languages:** English and French at runtime; a test fails when a key is missing from one catalog.
4. **F3, accessibility:** a login form audited for WCAG 2.1 AA with axe in a real Chromium, in its idle and error states, plus a keyboard-only login.
5. **F4, the builder:** add, remove and reorder nodes with mouse and keyboard, the three save-time reference errors, one condition at most, 200 nodes rendered.
6. **F5, security:** OIDC authorization code with PKCE against a local fake provider, the token kept in memory only, and a node name containing hostile HTML that must stay inert.
7. **F6, Android:** a debug APK built entirely in Docker (JDK 17, Android SDK 34, no local SDK), with a server address setting that persists and no builder.

Then four measurements: bundle size and a cold load in Chromium (median of 11), the Android build and its APK, the runtime dependency tree, and the advisory history (OSV database, queried on 2026-11-23).

| Test                                                  | React + Expo                               | Svelte + Capacitor                        | Solid + Capacitor                                |
| ----------------------------------------------------- | ------------------------------------------ | ----------------------------------------- | ------------------------------------------------ |
| Probes passed, of 7                                   | 7                                          | 7                                         | 7                                                |
| Manual fixes, wrong APIs used                         | 7, 0                                       | 12, 0                                     | 9, 0                                             |
| Web JavaScript, gzipped                               | 90.8 kB                                    | 25.8 kB                                   | 12.0 kB                                          |
| First paint, load event, JS heap                      | 64 ms, 37 ms, 2.4 MB                       | 36 ms, 25 ms, 1.9 MB                      | 36 ms, 18 ms, 1.7 MB                             |
| Axe violations (login, error state, builder)          | 0                                          | 0                                         | 0                                                |
| Builder                                               | buttons only; condition is a label         | keyboard; two editable condition branches | keyboard and drag and drop; condition is a label |
| Android APK, Gradle build                             | 46.8 MB (arm64 only), 321 s                | 3.77 MB, 90 s                             | 3.76 MB, 92 s                                    |
| Permissions in the debug APK                          | 7                                          | `INTERNET` only                           | `INTERNET` only                                  |
| Runtime packages, web and mobile                      | 8 and 478                                  | 21 and 3                                  | 6 and 3                                          |
| Advisories on core packages: all time, since Dec 2024 | web 5 and 0; Expo and React Native 3 and 0 | 14 and 12 (one HIGH)                      | 1 and 1 (HIGH, fixed in 2025)                    |
| Known vulnerabilities in the installed versions       | 1 moderate (mobile build tooling)          | 0                                         | 0                                                |

What stood out:

- **The newest versions did not work with our tooling.** Solid 2.0.3 is the default install, but the spike's Vite plugin (`vite-plugin-solid`) supports version 1 only, so it pinned 1.9.20. Solid 2.0.0 shipped on 2026-11-17 with a new plugin, `@solidjs/vite-plugin` 3, which does support it; Solid 2 was not tested here. Capacitor 8.6.2 needs JDK 21 and defaults to Android SDK 36, where the spike's Docker image had JDK 17 and SDK 34, so the spike pinned 6.2.3, which contains the fix for a critical advisory of October 2026. The image is ours: see the decision. TypeScript 7 broke the OpenAPI generator and Svelte's type checker (Svelte went back to 5.9.3) and Expo uses 5.9 too.
- **Translations:** React added `i18next` (18 kB); Svelte and Solid wrote 25 to 40 lines whose catalogs are typed, so a missing key also fails the compiler.
- **Builder:** all three chose an ordered list because the order is the execution order; no canvas library was tested. None tests a node referencing itself.
- **Login:** all three wrote OIDC and PKCE by hand; refresh, logout and provider errors were not tested.
- **Not tested:** installing on a device or emulator, rendering in the WebView or React Native, the real network call from the app, release-build permissions, native accessibility (TalkBack), and phone layouts: the pages are unstyled, so no overflow was found but nothing was designed for touch (default controls are under 24 px). Responsive layout is CSS work that does not depend on the framework.

Spike code is in local repositories, not pushed. Raw logs are not in this repository yet; they go under `docs/plan/spikes/` with the back-end ones before the ADR is accepted.

## Weighted matrix

Weights: **3** = the subject requires it, **2** = shapes cost or risk over the project. Scores 1 to 5 (5 is best), the number in brackets is score times weight: total weight 23, maximum 115.

**Scored from the tests above; the weights are the owner's proposal**, and the learning-curve row was added in review, as in [`tech-backend.md`](tech-backend.md). Before the ADR is accepted, each member scores the matrix alone, as the [bootstrap](../subject/BOOTSTRAP.md#weighted-decision-matrix) asks; any criterion where two members differ by more than 2 points is discussed and recorded here.

| Criterion                                                       | Weight | React + Expo | Svelte + Capacitor | Solid + Capacitor |
| --------------------------------------------------------------- | ------ | ------------ | ------------------ | ----------------- |
| Security: advisories, XSS defaults, token storage, dependencies | 3      | 3 (9)        | 2 (6)              | 3 (9)             |
| Accessibility and two languages                                 | 3      | 4 (12)       | 4 (12)             | 4 (12)            |
| Builder                                                         | 3      | 3 (9)        | 4 (12)             | 3 (9)             |
| Android APK built in Docker                                     | 3      | 2 (6)        | 4 (12)             | 4 (12)            |
| Code shared web and mobile, client from OpenAPI                 | 2      | 2 (4)        | 4 (8)              | 4 (8)             |
| Testing                                                         | 2      | 4 (8)        | 4 (8)              | 4 (8)             |
| Speed and weight                                                | 2      | 2 (4)        | 4 (8)              | 5 (10)            |
| Ease of getting it right: fixes, versions, tooling              | 2      | 4 (8)        | 2 (4)              | 3 (6)             |
| Learning curve and oral defense                                 | 3      | 5 (15)       | 4 (12)             | 3 (9)             |
| **Total, out of 115**                                           |        | **75**       | **82**             | **83**            |
| **Weighted average, 1 to 5**                                    |        | **3.26**     | **3.57**           | **3.61**          |

Why: **Security** React has few recent advisories but 478 mobile packages; Svelte has 14 advisories, 12 of them recent and mostly XSS; Solid has one, and a smaller audited base. **Builder** only Svelte has editable condition branches; Solid adds drag and drop. **Android** the two Capacitor builds are 12 times smaller and 3.5 times faster than React Native's, with one permission. **Code shared** Capacitor reuses the web build; React Native only shares logic and runs on another TypeScript. **Speed and weight** Solid is lightest on every measure. **Ease of getting it right** React needed the fewest fixes, Svelte the most (a TypeScript downgrade and a type checker that did not start). **Accessibility and two languages** weight 3 because the subject requires both for both clients ([subject](../subject/SUBJECT.md#technical-requirements)). **Learning curve and oral defense** weight 3, as in the back-end matrix: the subject requires every member to explain an architecture decision they contributed to, and the learning curve is how we read that requirement (a review choice the team can change). All four members have built a React app before, so React scores 5 even though Expo adds React Native and its own build chain; Svelte templates stay close to HTML with one toolkit; Solid's JSX looks like React but its reactivity does not behave like it (a component runs once, and destructuring props silently stops updates), a trap for React habits, with fewer examples to learn from.

**How fragile it is.** Across every integer weighting from 1 to 3 (19,683 of them), Solid wins 78%, Svelte 9%, React under 1% (135 weightings), the rest tie. The ranking between Solid and Svelte rests on security: giving Svelte a 3 there makes it 85 against 83. Its 2 is kept because its 12 recent advisories are mostly XSS, in a client that renders user-named nodes. Native mobile quality (native UI, TalkBack, notifications) is not in the matrix because it was not tested. Adding it with React Native 5 and the two WebView apps 2 gives React 85, Svelte 86, Solid 87 at weight 2 (the subject does not require a native app), and makes React the winner at weight 3, 90 against 89.

## Decision

**Proposed choice: Solid (TypeScript, Vite single-page app) with Capacitor for Android**, the matrix's winner, pending the team's acceptance of [ADR 0002](../adr/0002-frontend-solid-capacitor.md).

- **The criteria that decided it:** against React, the Android build in Docker with the web code reused (a 3.8 MB APK built in 92 seconds, three mobile packages); against Svelte, security (Svelte's recent XSS advisories), weight (12 kB of JavaScript) and fewer fixes (9 against 12). Leveling any one of these three hands the lead to Svelte.
- **Trade-off we accept:** a smaller ecosystem, Solid 1.9 rather than 2.0 (released 2026-11-17 with a new Vite plugin, untested here; the web probes are rerun on it before the MVP), and a WebView mobile app whose native feel is untested. To survive it: keep the mobile screens small (list, toggle, history), run a TalkBack check and a 200-workflow scroll test before the MVP.
- **Capacitor version:** Capacitor 8, the current major (never below 8.5.1, the critical advisory's fix), on a Docker image with JDK 21 (required) and Android SDK 36 (its default); its command-line tool needs Node 22 or later, the repository uses 26. The spike only built Capacitor 6, so F6 is rerun with Capacitor 8 before the ADR is accepted, TypeScript configuration included; if it fails, Capacitor 6.2.x on JDK 17 and SDK 34 stays, as tested. Capacitor 9 is a release candidate (9.0.0-rc.0, 2026-11-12).
- **Runner-up: Svelte with Capacitor** (82 against 83): a better builder and an easier template syntax, but the most security advisories and the most fixes.
- **Team disagreement, open:** the owner prefers React with Expo (75) for the team's React experience (now scored) and a native mobile app (not tested, not required by the subject). Counting native quality at weight 3 would make React the winner (see how fragile it is). The team settles it when each member scores the matrix.
