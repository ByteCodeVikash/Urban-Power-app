/* eslint-env node */
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  // Check if iOS googleServicesFile is defined and exists
  const iosPlistPath = config.ios?.googleServicesFile;
  const iosPlistExists =
    iosPlistPath && fs.existsSync(path.resolve(__dirname, iosPlistPath));

  if (!iosPlistExists) {
    console.log(
      '[Expo Config] GoogleService-Info.plist not found. Temporarily disabling iOS Firebase plugin requirements.',
    );

    // Disable iOS googleServicesFile field to prevent build errors
    if (config.ios) {
      delete config.ios.googleServicesFile;
    }

    // Filter plugins to only load Android Firebase configuration
    if (config.plugins) {
      config.plugins = config.plugins
        .map(plugin => {
          if (plugin === '@react-native-firebase/app') {
            return './plugins/withAndroidOnlyFirebaseApp';
          }
          if (plugin === '@react-native-firebase/auth') {
            return null;
          }
          return plugin;
        })
        .filter(Boolean);
    }
  } else {
    console.log(
      '[Expo Config] GoogleService-Info.plist found. iOS Firebase configuration is enabled.',
    );
  }

  // Add Android Google Maps API Key configuration from environment variables
  if (!config.android) {
    config.android = {};
  }
  if (!config.android.config) {
    config.android.config = {};
  }
  config.android.config.googleMaps = {
    apiKey:
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '',
  };

  return config;
};
