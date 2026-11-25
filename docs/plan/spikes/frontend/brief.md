<!-- The method of the front-end spike probes, and how the Capacitor 8 rerun of the Android probe (F6) was made so it can be repeated. -->

# Front-end spike: brief and method

Summary, matrix and decision: [`../../tech-frontend.md`](../../tech-frontend.md) and [ADR 0002](../../../adr/0002-frontend-solid-capacitor.md). Results of the rerun: [`runs.md`](runs.md).

## The seven probes

Each candidate went through the same seven probes, one on top of the other in the same folder, with a 5-minute cap each (10 for Android). The briefs are listed in [`tech-frontend.md`](../../tech-frontend.md#tests-made): F0 built and served, F1 typed client, F2 two languages, F3 accessibility, F4 builder, F5 security, F6 Android. Every probe was verified by rerunning its tests, and one rule was broken on purpose to check a test failed. The spike code stays in local repositories (`~/projects/spikes-front`), outside this repository.

## F6, Android (the probe rerun on Capacitor 8)

**Brief:** a debug APK built entirely in Docker with no local SDK, a server address setting that persists, no builder. The mobile entry point (`mobile/index.html` and `src/mobile/`) shows the workflow list and the settings screen only.

**Rerun conditions (2026-11-25):**

- Image [`Dockerfile.android`](Dockerfile.android): Node 22 (the Capacitor 8 command-line tool needs 22 or later), Temurin JDK 21.0.13, Android SDK platform 36 and build-tools 36.0.0. The repository itself uses Node 26; the image does not.
- Capacitor `@capacitor/core`, `@capacitor/android` and `@capacitor/cli` at `^8.6.2` (the ADR floor is 8.5.1), TypeScript 7.0.2, Vite 8.3.8.
- Work on throwaway copies of the spike folders (without `node_modules`, `android` and build output), so the original spike is untouched.
- Steps, run inside the container as the host user (see "How to repeat"): `npm install`, `npm run build:mobile`, `npx cap add android`, `npx cap sync android`, then `./gradlew assembleDebug --no-daemon`, timed. Gradle's cache is not shared between runs, so every run is a cold build (the Gradle and Android Gradle plugin downloads are included in the time).
- Permissions read with `aapt2 dump permissions` from the SDK build-tools.

**Three runs:**

1. Solid, `capacitor.config.json` (the file the Capacitor 6 spike had to use).
2. Solid, `capacitor.config.ts`, with `capacitor.config.json` removed: checks that the command-line tool loads a TypeScript configuration file under TypeScript 7.
3. React DOM (the web client of the spike) in Capacitor, with `capacitor.config.ts`: a fourth candidate suggested on issue #35 and not tested before. The React mobile entry was written for this run, as a port of the Solid one.

## How to repeat

[`Dockerfile.android`](Dockerfile.android) is evidence for this spike, not the product's build image: the JDK floats on the latest 21 release, and the real client gets its own pinned image with the stack.

1. Build the image, from this folder:

   ```bash
   docker build -f Dockerfile.android -t area-android-cap8 .
   ```

2. Open a shell in it on a copy of a spike folder, as the host user:

   ```bash
   docker run --rm -it -v "<spike folder>:/app" -u "$(id -u):$(id -g)" \
     -e HOME=/tmp -e GRADLE_USER_HOME=/tmp/gradle area-android-cap8 bash
   ```

3. Inside it, run the steps above in order. Time the last one with `time ./gradlew assembleDebug --no-daemon`, then read the APK with `$ANDROID_HOME/build-tools/36.0.0/aapt2 dump permissions android/app/build/outputs/apk/debug/app-debug.apk`.

For the React folder, install with `npm install --legacy-peer-deps` (see the deviation in [`runs.md`](runs.md)).
