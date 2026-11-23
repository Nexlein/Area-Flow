# ADR 0002: Front-end: Solid and Capacitor

**Status:** Proposed · **Date:** 2026-11-23 · **Owner:** TeddyBertrand · **Issues:** #26

## Why a record

Both clients depend on it, and changing the UI framework or the way the Android app is built later means rewriting screens, tests and the build. It also fixes how much of the web code the Android app can reuse.

## Context

- The subject requires a web client with a web-only builder, an Android client with a configurable server address built by Docker Compose, WCAG AA, two languages, and OIDC and OAuth2 redirects ([subject](../subject/SUBJECT.md)).
- Rules: TypeScript only (repository), full-stack frameworks strongly discouraged (subject), so each client is a single-page app.
- Three candidates were tested the same way: seven probes, speed, weight and security ([`../plan/tech-frontend.md`](../plan/tech-frontend.md)).

## Alternatives

| Option                       | For this project                                                                                                                                                                                                                                                                    | What the product would look like with it                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A (chosen): Solid, Capacitor | Lightest: 12 kB of JavaScript, a 3.8 MB APK built in 92 s, three mobile packages, one permission. Mobile reuses the web build. Scored 83 of 115                                                                                                                                     | Web client in Solid; the Android app is the web build in a WebView, with a smaller entry point        |
| B: Svelte, Capacitor         | Scored 82, one point behind. The best builder (editable condition branches), the easiest templates and the same Android result. Not chosen here: 14 advisories (12 since December 2024, mostly XSS), the most manual fixes (12), TypeScript pushed back to 5.9 for its type checker | The same shape as A with Svelte                                                                       |
| C: React, Expo               | Scored 69. Fewest fixes, native UI, the largest ecosystem. Not chosen here: 91 kB of JavaScript, a 46.8 MB APK (one architecture) built in 321 s, 478 mobile packages, and a second UI codebase for the mobile app                                                                  | Web client in React DOM and Android in React Native: two sets of screens sharing only logic and types |

Angular with Ionic and Vue with Quasar were considered and not tested. Flutter and Kotlin were left out by the TypeScript-only rule.

## Decision

Solid 1.9.x (a Vite single-page app, not SolidStart) for the web client, and Capacitor 8.x for the Android client, built inside Docker with JDK 21 and Android SDK 36, which Capacitor 8 requires. The spike built Capacitor 6.2.3 on JDK 17 and SDK 34; the Android probe is rerun with Capacitor 8 before this ADR is accepted, and if it fails, Capacitor 6.2.x (never below 6.2.2) on JDK 17 and SDK 34 stays, as tested. The Android app has its own entry point with the workflow list and the server address setting, and never the builder. Exact versions are pinned when the clients are created.

## Consequences

- **Cost: Solid one major behind.** Solid 2.0.3 is current, but `vite-plugin-solid` supports `solid-js` 1 only. We accept it until the plugin supports version 2, and let Dependabot track the 1.9 line.
- **Cost: a Docker image to raise.** Capacitor 8 needs JDK 21 and Android SDK 36, where the spike's image had JDK 17 and SDK 34. We raise it now, while no client exists, rather than start on Capacitor 6, two majors behind and dependent on backported fixes.
- **Cost: a smaller ecosystem than React.** Fewer ready-made components and examples, so the team writes more of its own, as the spikes did for translations.
- **Cost: the mobile app is a WebView.** Native feel, TalkBack and scrolling a long list were not tested. We run a TalkBack check and a 200-workflow scroll test before the MVP, and keep the mobile screens small.
- **Cost: TypeScript 7 friction.** The Capacitor 6 command-line tool cannot load a TypeScript configuration file under TypeScript 7, so the spike used `capacitor.config.json` (JSON is not JavaScript, so the TypeScript-only rule holds); the OpenAPI generator needs a TypeScript 5.9 run.
- **Cost: login written by hand in the spike.** The real client needs a reviewed OIDC and PKCE implementation, with the token kept in memory only.
- **Limit: not tested.** Installing on a device, rendering in the WebView, the real network call from the app, release-build permissions, and phone layouts (the spike pages are unstyled).
- **Fact:** the critical Capacitor Android advisory of October 2026 is fixed in 6.2.2; OSV lists no known advisory for 6.2.3 or 8.6.2. ([OSV](https://osv.dev/vulnerability/CVE-2026-103922))
- **Fact:** Solid's only advisory, an XSS in JSX fragments, is fixed in 1.9.4. ([OSV](https://osv.dev/vulnerability/CVE-2025-27109))

## Evidence

All three candidates passed the seven probes. Web figures come from the production build; the Android figures from a debug APK built in Docker with Capacitor 6.2.3.

| Measure                      | Solid, Capacitor | Svelte, Capacitor | React, Expo              |
| ---------------------------- | ---------------- | ----------------- | ------------------------ |
| Web JavaScript, gzipped      | 12.0 kB          | 25.8 kB           | 90.8 kB                  |
| APK size, Gradle build       | 3.76 MB, 92 s    | 3.77 MB, 90 s     | 46.8 MB (one ABI), 321 s |
| Runtime packages, mobile     | 3                | 3                 | 478                      |
| Manual fixes over the probes | 9                | 12                | 7                        |

The weighted matrix, its weights and how fragile the ranking is are in [`../plan/tech-frontend.md`](../plan/tech-frontend.md#weighted-matrix). Raw probe logs are not kept in this repository.

## History

- 2026-11-23: created, `Proposed`. Awaiting the team's acceptance.
- 2026-11-23: review: accessibility and two languages at weight 3, the learning-curve criterion added (Solid 83, Svelte 82, React 69), and Capacitor 8 on JDK 21 proposed, pending a rerun of the Android probe. Each member scores the matrix before acceptance.
