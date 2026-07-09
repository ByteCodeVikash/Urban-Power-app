# Android Release Keystore Setup Guide

This guide explains how to generate, place, and configure the Android release keystore and signing credentials for the **Urban Power** production application.

---

## 1. Security Warnings & Git Hygiene

> [!CAUTION]
> **NEVER commit the following files to version control (Git):**
>
> - The production keystore file (`*.jks` or `*.keystore`)
> - The credentials properties file (`key.properties`)
> - Any raw passwords, aliases, or secret credentials
>
> Committing these files exposes your application's signing keys to unauthorized parties, allowing them to publish malicious updates under your app identity.

The project is pre-configured with `.gitignore` rules inside the `android/` directory to prevent accidental commits of these sensitive files:

- `key.properties`
- `*.keystore`
- `*.jks`

---

## 2. Generating the Upload/Release Keystore

To sign your production application, you need to generate a secure keystore file. You can generate a release keystore using the `keytool` command-line utility (bundled with Java Development Kit (JDK)).

Run the following command in your terminal:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore urban-power-release.keystore \
  -alias urban-power-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

### Prompt Details:

- **Keystore Name (`-keystore`)**: `urban-power-release.keystore` (or `upload-keystore.jks`)
- **Key Alias (`-alias`)**: `urban-power-key-alias` (a unique identifier for the key within the keystore)
- **Validity (`-validity`)**: `10000` (validity in days, ~27 years)
- **Key Algorithm (`-keyalg RSA -keysize 2048`)**: Standard RSA 2048-bit encryption.

You will be prompted to enter a **Keystore password**, followed by your name, organizational unit, organization, city, state, and country code. Finally, confirm the information by typing `yes` or `y`.

---

## 3. Placement of Files

### A. The Keystore File

Place the generated keystore file (e.g., `urban-power-release.keystore` or `upload-keystore.jks`) in the following directory:

```
android/app/
```

_(Gradle will resolve relative paths relative to the `android/app` directory. If you place it here, you can simply specify the filename in `key.properties`.)_

### B. The `key.properties` File

Create a new file named `key.properties` in the following directory:

```
android/
```

_(This is the root of the Android project directory where it can be securely read by the Gradle build script.)_

---

## 4. Configuring `key.properties`

Use the template provided in `android/key.properties.example` to construct your `android/key.properties` file:

```properties
# Location of the keystore file.
# Since Gradle resolves file() paths relative to the android/app folder,
# you can use the filename if placed in android/app/, or a relative path (e.g., ../keystore_name.jks)
# if placed in the android/ root.
storeFile=urban-power-release.keystore

# The keystore password you set when running keytool
storePassword=your_secure_keystore_password

# The key alias you set when running keytool
keyAlias=urban-power-key-alias

# The key password you set when running keytool (usually the same as storePassword for PKCS12)
keyPassword=your_secure_key_password
```

---

## 5. Gradle Build Configuration

The `android/app/build.gradle` script has been updated to automatically detect and load release signing credentials from `key.properties`.

Here is the logic implemented in `android/app/build.gradle`:

```groovy
// 1. Load key.properties from the Android root directory (android/key.properties)
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }

        // 2. Configure release signing dynamically using key.properties values
        release {
            if (keystoreProperties.containsKey('storeFile') &&
                keystoreProperties.containsKey('storePassword') &&
                keystoreProperties.containsKey('keyAlias') &&
                keystoreProperties.containsKey('keyPassword')) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }

    buildTypes {
        release {
            // 3. Apply the release signing configuration
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

---

## 6. How to Build the Release Application

Once `key.properties` is configured and the keystore file is placed in `android/app/`, you can build the production-ready APK or Android App Bundle (AAB):

### To Build Android App Bundle (AAB) (Recommended for Play Store):

```bash
cd android
./gradlew bundleRelease
```

The generated bundle will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

### To Build Standalone APK:

```bash
cd android
./gradlew assembleRelease
```

The generated APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`
