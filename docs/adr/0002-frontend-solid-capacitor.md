# ADR 0002: Front-end: Solid and Capacitor

**Status:** Proposed · **Date:** 2026-11-23 · **Owner:** TeddyBertrand · **Issues:** #26

## Why a record

Both clients depend on it, and changing the UI framework or the way the Android app is built later means rewriting screens, tests and the build. It also fixes how much of the web code the Android app can reuse.

## Context

- The subject requires a web client with a web-only builder, an Android client with a configurable server address built by Docker Compose, WCAG AA, two languages, and OIDC and OAuth2 redirects ([subject](../subject/SUBJECT.md)).
- Rules: TypeScript only (repository), full-stack frameworks strongly discouraged (subject), so each client is a single-page app.
- Three candidates were tested the same way: seven probes, speed, weight and security ([`../plan/tech-frontend.md`](../plan/tech-frontend.md)).

## Alternatives

| Option                         | For this project                                                                                                                                                                                                                                   | What the product would look like with it                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A (proposed): Solid, Capacitor | Scored 83 of 115. Lightest: 12 kB of JavaScript, a 3.8 MB APK built in 92 s, three mobile packages, one permission. Mobile reuses the web build                                                                                                    | Web client in Solid; the Android app is the web build in a WebView, with a smaller entry point        |
| B: Svelte, Capacitor           | Scored 82. Best builder (editable condition branches), easiest templates, same Android result. Not chosen here: 14 advisories (12 since December 2024, mostly XSS), the most manual fixes (12), TypeScript pushed back to 5.9 for its type checker | The same shape as A with Svelte                                                                       |
| C: React, Expo                 | Scored 75. Used by the whole team, fewest fixes, native UI, largest ecosystem. Not chosen here: 91 kB of JavaScript, a 46.8 MB APK (one architecture) built in 321 s, 478 mobile packages, a second UI codebase                                    | Web client in React DOM and Android in React Native: two sets of screens sharing only logic and types |

Angular with Ionic and Vue with Quasar were considered and not tested. Flutter and Kotlin were left out by the TypeScript-only rule ([why](../plan/tech-backend.md#language)).

## Decision

Solid 1.9.x (a Vite single-page app, not SolidStart) for the web client, and Capacitor 8.x, never below 8.5.1, for the Android client, built inside Docker with JDK 21, which Capacitor 8 requires, and Android SDK 36, its default. The Android app has its own entry point with the workflow list and the server address setting, and never the builder. Exact versions are pinned when the clients are created.

## Consequences

| Cost or limit                                                                                                                                                                                                                                                                                                                                                                         | How we survive it                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Solid one major behind: Solid 2.0.0 shipped on 2026-11-17 with a new Vite plugin (`@solidjs/vite-plugin` 3); the spikes tested 1.9 with the old one (`vite-plugin-solid`, version 1 only). Accepted because 2.0 is days old and untested here                                                                                                                                         | Stay on 1.9 and let Dependabot track the 1.9 line; evaluate 2.x before the MVP by rerunning the web probes                                                                                                                                                    |
| A Docker image to raise: Capacitor 8 needs JDK 21 and defaults to Android SDK 36, where the spike's image had JDK 17 and SDK 34; its command-line tool needs Node 22 or later (the repository uses 26). Capacitor 9 is in release candidate (2026-11-12), so 8 will soon be one major behind too. Accepted because Capacitor 6 is two majors behind and dependent on backported fixes | We raise the image for the Android probe rerun, while no client exists                                                                                                                                                                                        |
| Capacitor 8 is not what the spike built (6.2.3, on JDK 17 and SDK 34)                                                                                                                                                                                                                                                                                                                 | F6 rerun on Capacitor 8.6.2 with JDK 21 and SDK 36 ([#35](https://github.com/Nexlein/Area-Flow/issues/35)): it passed, see [`runs.md`](../plan/spikes/frontend/runs.md). The Capacitor 6.2.x fallback (never below 6.2.2, JDK 17, SDK 34) is no longer needed |
| A smaller ecosystem than React: fewer ready-made components and examples, so the team writes more of its own, as the spikes did for translations                                                                                                                                                                                                                                      | —                                                                                                                                                                                                                                                             |
| The mobile app is a WebView: native feel, TalkBack and scrolling a long list were not tested                                                                                                                                                                                                                                                                                          | A TalkBack check and a 200-workflow scroll test before the MVP; keep the mobile screens small                                                                                                                                                                 |
| TypeScript 7 friction: the Capacitor 6 command-line tool cannot load a TypeScript configuration file under TypeScript 7. The OpenAPI generator needs a TypeScript 5.9 run                                                                                                                                                                                                             | The spike used `capacitor.config.json` (JSON is not JavaScript, so the TypeScript-only rule holds); the Capacitor 8 rerun showed its tool loads `capacitor.config.ts` under TypeScript 7, so the client can use the TypeScript file                           |
| Login written by hand in the spike                                                                                                                                                                                                                                                                                                                                                    | The real client needs a reviewed OIDC and PKCE implementation, with the token kept in memory only                                                                                                                                                             |
| Not tested: installing on a device, rendering in the WebView, the real network call from the app, release-build permissions, and phone layouts (the spike pages are unstyled)                                                                                                                                                                                                         | —                                                                                                                                                                                                                                                             |

- **Fact:** the critical Capacitor Android advisory of October 2026 affects, among others, 6.2.1, 7.x before 7.6.9, 8.x before 8.4.3, and 8.5.0; it is fixed in 6.2.2, 7.6.9, 8.4.3 and 8.5.1, and OSV lists no known advisory for 6.2.3 or 8.6.2. ([OSV](https://osv.dev/vulnerability/CVE-2026-103922))
- **Fact:** Solid's only advisory, an XSS in JSX fragments, is fixed in 1.9.4. ([OSV](https://osv.dev/vulnerability/CVE-2025-27109))

## Evidence

All three candidates passed the seven probes. Web figures come from the production build; the Android figures from a debug APK built in Docker with Capacitor 6.2.3.

| Measure                      | Solid, Capacitor | Svelte, Capacitor | React, Expo                       |
| ---------------------------- | ---------------- | ----------------- | --------------------------------- |
| Web JavaScript, gzipped      | 12.0 kB          | 25.8 kB           | 90.8 kB                           |
| APK size, Gradle build       | 3.76 MB, 92 s    | 3.77 MB, 90 s     | 46.8 MB (one architecture), 321 s |
| Runtime packages, mobile     | 3                | 3                 | 478                               |
| Manual fixes over the probes | 9                | 12                | 7                                 |

The weighted matrix, its weights and how fragile the ranking is are in [`../plan/tech-frontend.md`](../plan/tech-frontend.md#weighted-matrix). The method, the Android rerun results and the commands to repeat them are in [`../plan/spikes/frontend/`](../plan/spikes/frontend/runs.md).

## History

- 2026-11-23: created, `Proposed`. Awaiting the team's acceptance.
- 2026-11-23: review: accessibility and two languages at weight 3, the learning-curve criterion added (Solid 83, Svelte 82, React 69), and Capacitor 8 on JDK 21 proposed, pending a rerun of the Android probe. Each member scores the matrix before acceptance.
- 2026-11-24: the whole team has used React, so React scores 5 on the learning curve (React 75, Solid and Svelte unchanged). The owner's preference for React is recorded as an open team disagreement in [`../plan/tech-frontend.md`](../plan/tech-frontend.md#decision).
- 2026-11-24: the Capacitor 6 fallback moved from Decision to Consequences, and the chosen option renamed "proposed". Decision unchanged.
- 2026-11-25: F6 rerun on Capacitor 8.6.2 (JDK 21, SDK 36, Docker): debug APK built for Solid (4.13 MB, 82 s, `INTERNET` only) and for React with Capacitor (4.20 MB, 76 s), and the TypeScript configuration file loads under TypeScript 7. Capacitor 8 stays; the Capacitor 6 fallback is not needed. Not installed on a device. Results in [`../plan/spikes/frontend/`](../plan/spikes/frontend/runs.md) (#35).
