import { createRunOncePlugin } from "@expo/config-plugins";
const pkg = { name: "react-native-vector-image", version: "UNVERSIONED" };
/**
 * Apply BLE configuration for Expo SDK 42 projects.
 */
const withVectorImage = (config, props = {}) => {
    const _props = props || {};
    return config;
};
export default createRunOncePlugin(withVectorImage, pkg.name, pkg.version);
//# sourceMappingURL=withVectorImage.js.map