# ADR 0002: Front-end: Solid and Capacitor

**Status:** Proposed · **Date:** 2026-11-23 · **Owner:** TeddyBertrand · **Issues:** #26

## Why a record

Both clients depend on it, and changing the UI framework or the way the Android app is built later means rewriting screens, tests and the build. It also fixes how much of the web code the Android app can reuse.

## Context

- The subject requires a web client with a web-only builder, an Android client with a configurable server address built by Docker Compose, WCAG AA, two languages, and OIDC and OAuth2 redirects ([subject](../subject/SUBJECT.md)).
- Repository rules: TypeScript only, no full-stack framework, so each client is a single-page app.
- Three candidates were tested the same way: seven probes, speed, weight and security ([`../plan/tech-frontend.md`](../plan/tech-frontend.md)).

## Alternatives

| Option                       | For this project                                                                                                                                                                                                                           | What the product would look like with it                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| A (chosen): Solid, Capacitor | Lightest: 12 kB of JavaScript, a 3.8 MB APK built in 92 s, three mobile packages, one permission. Mobile reuses the web build. Scored 70 of 95                                                                                             | Web client in Solid; the Android app is the web build in a WebView, with a smaller entry point        |
| B: Svelte, Capacitor         | Scored 66. The best builder (editable condition branches) and the same Android result. Not chosen here: 14 advisories (12 since December 2024, mostly XSS), the most manual fixes (12), TypeScript pushed back to 5.9 for its type checker | The same shape as A with Svelte                                                                       |
| C: React, Expo               | Scored 56. Fewest fixes, native UI, the largest ecosystem. Not chosen here: 91 kB of JavaScript, a 46.8 MB APK (one architecture) built in 321 s, 478 mobile packages, and a second UI codebase for the mobile app                         | Web client in React DOM and Android in React Native: two sets of screens sharing only logic and types |

Angular with Ionic and Vue with Quasar were considered and not tested. Flutter and Kotlin were left out by the TypeScript-only rule.

## Decision

Solid 1.9.x (a Vite single-page app, not SolidStart) for the web client, and Capacitor 6.2.x, never below 6.2.2, for the Android client, built with JDK 17 and Android SDK 34 inside Docker. The Android app has its own entry point with the workflow list and the server address setting, and never the builder. Exact versions are pinned when the clients are created.

## Consequences

- **Cost: versions behind the latest.** Solid 2.0.3 and Capacitor 8.6.2 do not work with our tooling (the Vite plugin supports Solid 1 only; Capacitor 8 needs JDK 21). We accept it for now. We survive it by letting Dependabot and Renovate track the pinned lines, and by raising the Docker image to JDK 21 and a newer SDK when Capacitor has to move.
- **Cost: a smaller ecosystem than React.** Fewer ready-made components and examples, so the team writes more of its own, as the spikes did for translations.
- **Cost: the mobile app is a WebView.** Native feel, TalkBack and scrolling a long list were not tested. We run a TalkBack check and a 200-workflow scroll test before the MVP, and keep the mobile screens small.
- **Cost: TypeScript 7 friction.** The Capacitor 6 command-line tool cannot load a TypeScript configuration file under TypeScript 7, so the spike used a JSON one, a deviation from the TypeScript-only rule to settle; the OpenAPI generator needs a TypeScript 5.9 run.
- **Cost: login written by hand in the spike.** The real client needs a reviewed OIDC and PKCE implementation, with the token kept in memory only.
- **Limit: not tested.** Installing on a device, rendering in the WebView, the real network call from the app, release-build permissions, and phone layouts (the spike pages are unstyled).
- **Fact:** the critical Capacitor Android advisory of October 2026 is fixed in 6.2.2. ([OSV](https://osv.dev/vulnerability/CVE-2026-103922))
- **Fact:** Solid's only advisory, an XSS in JSX fragments, is fixed in 1.9.4. ([OSV](https://osv.dev/vulnerability/CVE-2025-27109))

## Evidence

All three candidates passed the seven probes. Web figures come from the production build; the Android figures from a debug APK built in Docker.

| Measure                      | Solid, Capacitor | Svelte, Capacitor | React, Expo              |
| ---------------------------- | ---------------- | ----------------- | ------------------------ |
| Web JavaScript, gzipped      | 12.0 kB          | 25.8 kB           | 90.8 kB                  |
| APK size, Gradle build       | 3.76 MB, 92 s    | 3.77 MB, 90 s     | 46.8 MB (one ABI), 321 s |
| Runtime packages, mobile     | 3                | 3                 | 478                      |
| Manual fixes over the probes | 9                | 12                | 7                        |

The weighted matrix, its weights and how fragile the ranking is are in [`../plan/tech-frontend.md`](../plan/tech-frontend.md#weighted-matrix). Raw probe logs are not kept in this repository.

## History

- 2026-11-23: created, `Proposed`. Awaiting the team's acceptance.
