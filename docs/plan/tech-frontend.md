# Technology selection: front-end

**Status:** Draft · **Owner:** TeddyBertrand (the team confirms) · **Decision:** Solid with Capacitor, proposed ([ADR 0002](../adr/0002-frontend-solid-capacitor.md))

**Scope:** the web client and the Android client: frameworks, shared code or not, UI and i18n libraries, how the builder is drawn.

**Drives the choice** ([subject](../subject/SUBJECT.md)): separate from the server · web-only builder · Android with a configurable server address, APK built by Docker Compose · WCAG AA · two languages · OIDC and OAuth2 redirects on web and mobile.

## What we compared

- **TypeScript only** (repository rule), so Kotlin and Flutter are out; **no full-stack framework** (subject), so Next.js, SvelteKit and SolidStart are out. Each candidate is a single-page app.
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

- **The newest versions did not work with our tooling.** Solid 2.0.3 is the default install but its Vite plugin supports version 1 only (pinned to 1.9.20). Capacitor 8.6.2 needs JDK 21 and a newer Android SDK than our image (pinned to 6.2.3, which contains the fix for a critical advisory of October 2026). TypeScript 7 broke the OpenAPI generator and Svelte's type checker (Svelte went back to 5.9.3) and Expo uses 5.9 too.
- **Translations:** React added `i18next` (18 kB); Svelte and Solid wrote 25 to 40 lines whose catalogs are typed, so a missing key also fails the compiler.
- **Builder:** all three chose an ordered list because the order is the execution order; no canvas library was tested. None tests a node referencing itself.
- **Login:** all three wrote OIDC and PKCE by hand; refresh, logout and provider errors were not tested.
- **Not tested:** installing on a device or emulator, rendering in the WebView or React Native, the real network call from the app, release-build permissions, native accessibility (TalkBack), and phone layouts: the pages are unstyled, so no overflow was found but nothing was designed for touch (default controls are under 24 px). Responsive layout is CSS work that does not depend on the framework.

Spike code is in local repositories, not pushed. Raw logs are not kept in this repository.

## Weighted matrix

Weights: **3** = the subject requires it, **2** = shapes cost or risk over the project. Scores 1 to 5 (5 is best), the number in brackets is score times weight. "Team knowledge and learning goal" has no evidence yet, so it is not scored: total weight 19, maximum 95.

**Scored from the tests above; the weights are the owner's proposal.** The team can challenge any weight or score when it accepts the ADR; the matrix is not redone per member.

| Criterion                                                       | Weight | React + Expo | Svelte + Capacitor | Solid + Capacitor |
| --------------------------------------------------------------- | ------ | ------------ | ------------------ | ----------------- |
| Security: advisories, XSS defaults, token storage, dependencies | 3      | 3 (9)        | 2 (6)              | 3 (9)             |
| Accessibility and two languages                                 | 2      | 4 (8)        | 4 (8)              | 4 (8)             |
| Builder                                                         | 3      | 3 (9)        | 4 (12)             | 3 (9)             |
| Android APK built in Docker                                     | 3      | 2 (6)        | 4 (12)             | 4 (12)            |
| Code shared web and mobile, client from OpenAPI                 | 2      | 2 (4)        | 4 (8)              | 4 (8)             |
| Testing                                                         | 2      | 4 (8)        | 4 (8)              | 4 (8)             |
| Speed and weight                                                | 2      | 2 (4)        | 4 (8)              | 5 (10)            |
| Ease of getting it right: fixes, versions, tooling              | 2      | 4 (8)        | 2 (4)              | 3 (6)             |
| **Total, out of 95**                                            |        | **56**       | **66**             | **70**            |
| **Weighted average, 1 to 5**                                    |        | **2.95**     | **3.47**           | **3.68**          |

Why: **Security** React has few recent advisories but 478 mobile packages; Svelte has 14 advisories, 12 of them recent and mostly XSS; Solid has one, and a smaller audited base. **Builder** only Svelte has editable condition branches; Solid adds drag and drop. **Android** the two Capacitor builds are 12 times smaller and 3.5 times faster than React Native's, with one permission. **Code shared** Capacitor reuses the web build; React Native only shares logic and runs on another TypeScript. **Speed and weight** Solid is lightest on every measure. **Ease of getting it right** React needed the fewest fixes, Svelte the most (a TypeScript downgrade and a type checker that did not start).

**How fragile it is.** Across 20,000 random weightings (each criterion 1 to 3), Solid won 99%, and neither Svelte nor React won outright. But the margin over Svelte is small: giving Svelte a 3 in security makes it 69 against 70. The security scores are the most contestable. Native mobile quality (native UI, TalkBack, notifications) is not in the matrix because it was not tested; with a generous untested criterion for it, React Native would tie Solid at 76 each.

## Decision

**Final choice: Solid (TypeScript, Vite single-page app) with Capacitor for Android**, proposed by the owner, pending the team's acceptance of [ADR 0002](../adr/0002-frontend-solid-capacitor.md).

- **The two criteria that decided it:** the Android build in Docker with the web code reused, and speed and weight (12 kB of JavaScript, a 3.8 MB APK, a 90-second build, three mobile packages).
- **Trade-off we accept:** a smaller ecosystem, pinned versions (Solid 1.9, Capacitor 6), and a mobile app that is a WebView, whose native feel is untested. To survive it: keep the mobile screens small (list, toggle, history), run a TalkBack check and a 200-workflow scroll test before the MVP, and raise the Docker image to JDK 21 to move Capacitor forward when needed.
- **Runner-up: Svelte with Capacitor** (66 against 70): a better builder, but more security advisories and the most fixes. **React with Expo** (56) is the choice if native mobile quality matters more than weight; that was not tested.
