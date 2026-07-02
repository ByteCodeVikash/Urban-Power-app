const { withPlugins } = require('@expo/config-plugins');
const {
  withBuildscriptDependency,
  withApplyGoogleServicesPlugin,
  withCopyAndroidGoogleServices,
} = require('../node_modules/@react-native-firebase/app/plugin/build/android');

const withAndroidOnlyFirebaseApp = config => {
  return withPlugins(config, [
    withBuildscriptDependency,
    withApplyGoogleServicesPlugin,
    withCopyAndroidGoogleServices,
  ]);
};

module.exports = withAndroidOnlyFirebaseApp;
