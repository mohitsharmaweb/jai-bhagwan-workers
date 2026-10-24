$ErrorActionPreference = "Stop"

Write-Host "=== 1. Building Web Assets (Vite) ===" -ForegroundColor Cyan
npm run build

Write-Host "=== 2. Syncing Capacitor Android Project ===" -ForegroundColor Cyan
npx cap sync android

Write-Host "=== 3. Setting up Android & Java Environment ===" -ForegroundColor Cyan
$env:JAVA_HOME = "C:\Users\A\android_build_tools\jdk-17"
$env:ANDROID_HOME = "C:\Users\A\android_build_tools\android-sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\A\android_build_tools\android-sdk"
$env:PATH = "$($env:JAVA_HOME)\bin;$($env:ANDROID_HOME)\cmdline-tools\latest\bin;$($env:ANDROID_HOME)\platform-tools;$env:PATH"

Write-Host "Java version:" -ForegroundColor Yellow
& "$($env:JAVA_HOME)\bin\java.exe" -version

Write-Host "=== 4. Building Android APK via Gradle ===" -ForegroundColor Cyan
Push-Location "c:\Users\A\Desktop\jai bhagwan workers list\android"
try {
    if (Test-Path ".\gradlew.bat") {
        & ".\gradlew.bat" assembleDebug --stacktrace
    } else {
        & "C:\Users\A\android_build_tools\gradle-8.5\bin\gradle.bat" assembleDebug --stacktrace
    }
} finally {
    Pop-Location
}

$apkSource = "c:\Users\A\Desktop\jai bhagwan workers list\android\app\build\outputs\apk\debug\app-debug.apk"
$apkDest = "c:\Users\A\Desktop\jai bhagwan workers list\ApnaWorker.apk"

if (Test-Path $apkSource) {
    Copy-Item -Path $apkSource -Destination $apkDest -Force
    Copy-Item -Path $apkSource -Destination "c:\Users\A\Desktop\jai bhagwan workers list\JaiBhagwanWorkers.apk" -Force
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! APK Generated Successfully: " -ForegroundColor Green
    Write-Host " $apkDest" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Error "APK file not found at expected location: $apkSource"
}
