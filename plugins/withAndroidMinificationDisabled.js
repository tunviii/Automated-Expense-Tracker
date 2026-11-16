const { withGradleProperties } = require("@expo/config-plugins");

/** Disable R8 only for internal preview builds while diagnosing Expo Modules v2 registration. */
module.exports = function withAndroidMinificationDisabled(config) {
  if (process.env.EAS_BUILD_PROFILE !== "preview") {
    return config;
  }

  return withGradleProperties(config, (config) => {
    const key = "android.enableMinifyInReleaseBuilds";
    const property = config.modResults.find(
      (entry) => entry.type === "property" && entry.key === key,
    );

    if (property) {
      property.value = "false";
    } else {
      config.modResults.push({ type: "property", key, value: "false" });
    }

    return config;
  });
};
