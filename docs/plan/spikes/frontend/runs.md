<!-- Results of the front-end F6 (Android) rerun on Capacitor 8: build times, APK sizes, permissions, deviations, and what the rerun does not prove. -->

# Spike runs: F6 on Capacitor 8

Method and conditions: [`brief.md`](brief.md). The runs are repeatable with [`Dockerfile.android`](Dockerfile.android) and the steps in the brief, so full build output is not kept. Single run of each build, by TeddyBertrand with an agent, on 2026-11-25, on one machine (WSL2). Every Gradle build was cold.

Versions: Node 22.23.5, JDK Temurin 21.0.13, Android SDK 36 (build-tools 36.0.0), Capacitor 8.6.2 (core, android, cli), TypeScript 7.0.2.

## Results

| Run                              | Result | Gradle build | Debug APK | Permissions                                         | Web JS, gzipped (mobile entry) |
| -------------------------------- | ------ | ------------ | --------- | --------------------------------------------------- | ------------------------------ |
| Solid, `capacitor.config.json`   | pass   | 82 s         | 4.13 MB   | `INTERNET` (plus the app's own receiver permission) | 6.7 kB                         |
| Solid, `capacitor.config.ts`     | pass   | 77 s         | 4.13 MB   | same                                                | 6.7 kB                         |
| React DOM, `capacitor.config.ts` | pass   | 76 s         | 4.20 MB   | same                                                | 68.4 kB                        |

For comparison, the Capacitor 6 spike (JDK 17, SDK 34): Solid 3.76 MB in 92 s; Svelte 3.77 MB in 90 s. The APK is about 0.4 MB larger on Capacitor 8; Gradle is not slower.

- The APK targets and compiles against SDK 36 (`aapt2 dump badging`: `compileSdkVersion 36`, `targetSdkVersion 36`).
- The only permission the app asks for is `android.permission.INTERNET`. `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` is declared by AndroidX for the app itself, not a user-facing permission.
- **TypeScript configuration file: works.** With the JSON file removed, `npx cap add android` and `npx cap sync android` load `capacitor.config.ts` under TypeScript 7.0.2, which the Capacitor 6 tool could not. The deviation from the TypeScript-only rule noted in the ADR is therefore gone for Capacitor 8.
- The Solid mobile bundle is smaller here (6.7 kB) than the 12.0 kB of the web build in the ADR because the mobile entry has no builder; the two numbers must not be compared as one.

## APK inspection

Output of the SDK's `aapt2` (`dump permissions`, and `dump badging` filtered to the package and SDK lines), run in the image on the debug APK of each project. The two Solid builds produce the same APK size, so the Solid output below was taken from the last one (TypeScript configuration).

Solid (`app-debug.apk`, 4,125,686 bytes) and React (`app-debug.apk`, 4,199,058 bytes) print the same lines:

```text
package: com.area.mobile
uses-permission: name='android.permission.INTERNET'
permission: com.area.mobile.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION
uses-permission: name='com.area.mobile.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
package: name='com.area.mobile' versionCode='1' versionName='1.0' platformBuildVersionName='16' platformBuildVersionCode='36' compileSdkVersion='36' compileSdkVersionCodename='16'
targetSdkVersion:'36'
```

## Deviations and manual fixes

- **React install needs `--legacy-peer-deps`.** `openapi-typescript` 7.13.0 declares a TypeScript 5 peer and the spike uses 7.0.2, so a plain `npm install` fails with `ERESOLVE`. It is the TypeScript 7 friction already in the ADR, not a Capacitor problem. As a consequence `npm ls` exits non-zero (`ELSPROBLEMS`); the run went on regardless.
- **React mobile entry written for this run:** `mobile/index.html`, `src/mobile/main.tsx`, `src/mobile/serverAddress.ts`, `vite.mobile.config.ts` and `capacitor.config.ts`, copied in shape from the Solid mobile entry. About 90 lines, no fix needed after the first write.
- Solid needed only the three package versions raised from `^6.2.3` to `^8.6.2`; no source change.

## Not proven

- The APK was **not installed or run** on a device or emulator, so the WebView rendering, the persisted address and the real network call from the app are untested, as before.
- One run per build, cold cache, one machine: times vary by a few seconds, and APK sizes by nothing.
- React + Capacitor passed F6 only. Its probes F0 to F5 are the React web results already scored; nothing was rerun.
- Release builds (signing, minification, release-only permissions) were not made.
- The scores in `docs/plan/scores.md` are not changed here.
- The build times and the TypeScript configuration result come from console output that was not kept; they can be reproduced with the steps in the brief.
