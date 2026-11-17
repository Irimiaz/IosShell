// Expo loads .env into process.env before evaluating this file, so values
// set there (without the EXPO_PUBLIC_ prefix) can be passed to the app here.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    username: process.env.username,
  },
});
