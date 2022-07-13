import { ConfigPlugin, createRunOncePlugin } from "@expo/config-plugins";

const pkg = { name: "react-native-vector-image", version: "UNVERSIONED" };
/**
 * Apply BLE configuration for Expo SDK 42 projects.
 */
const withVectorImage: ConfigPlugin<{} | void> = (config, props = {}) => {
  const _props = props || {};

  return config;
};

export default createRunOncePlugin(withVectorImage, pkg.name, pkg.version);
