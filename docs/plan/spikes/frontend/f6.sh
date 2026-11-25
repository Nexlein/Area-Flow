set -ex
# F6 build inside the container: web build for mobile, Capacitor Android project, debug APK, with the Gradle time.
cd /app
node -v
java -version
npm install --no-audit --no-fund ${NPM_FLAGS:-}
npm ls @capacitor/core @capacitor/android @capacitor/cli typescript || true
npm run build:mobile
rm -rf android
npx cap add android
npx cap sync android
cd android
start=$(date +%s)
./gradlew assembleDebug --no-daemon
echo "GRADLE_SECONDS=$(( $(date +%s) - start ))"
ls -l app/build/outputs/apk/debug/
