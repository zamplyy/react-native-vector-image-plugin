"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPBXShellScriptBuildPhaseStripSvg = exports.addStripSvgsImplementation = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const addStripSvgsImplementation = (projectBuildGradle) => {
    const addString = `apply from: new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), "../../react-native-vector-image/strip_svgs.gradle")`;
    const searchString = /"..\/react.gradle"\)\n/gm;
    if (projectBuildGradle.includes(addString)) {
        return projectBuildGradle;
    }
    return projectBuildGradle.replace(searchString, `"../react.gradle")\n${addString}`);
};
exports.addStripSvgsImplementation = addStripSvgsImplementation;
const withAndroidPlugin = (config) => {
    return (0, config_plugins_1.withAppBuildGradle)(config, ({ modResults, ...config }) => {
        modResults.contents = (0, exports.addStripSvgsImplementation)(modResults.contents);
        return { modResults, ...config };
    });
};
const addSlashes = (str) => {
    return str.replace(/[\\"]/g, "\\$&").replace(/\u0000/g, "\\0");
};
const setPBXShellScriptBuildPhaseStripSvg = async (config) => {
    const xcodeProject = config.modResults;
    const pbxShellScriptBuildPhases = xcodeProject.hash.project.objects.PBXShellScriptBuildPhase;
    for (const buildPhase of Object.values(pbxShellScriptBuildPhases)) {
        if ((buildPhase === null || buildPhase === void 0 ? void 0 : buildPhase.name) === '"Bundle React Native code and images"' &&
            !(buildPhase === null || buildPhase === void 0 ? void 0 : buildPhase.shellScript.includes('"react-native-vector-image"'))) {
            const parts = [
                'export NODE_BINARY=node\\n\\n# The project root by default is one level up from the ios directory\\nexport PROJECT_ROOT=\\"$PROJECT_DIR\\"/..\\n\\n',
                addSlashes(`\`node --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"\``),
                addSlashes(`\`node --print "require('path').dirname(require.resolve('react-native/package.json')) + '/../react-native-vector-image/strip_svgs.sh'"\``),
            ];
            buildPhase.shellScript = `\"${parts.join("\\n")}\"`;
        }
    }
    return config;
};
exports.setPBXShellScriptBuildPhaseStripSvg = setPBXShellScriptBuildPhaseStripSvg;
const withIosPlugin = (c) => {
    return (0, config_plugins_1.withXcodeProject)(c, async (config) => {
        config = await (0, exports.setPBXShellScriptBuildPhaseStripSvg)(config);
        return config;
    });
};
// export const withIosAssets: ConfigPlugin = (config) => {
//   return withDangerousMod(config, [
//     "ios",
//     async (config) => {
//       // No modifications are made to the config
//       // await setIconsAsync(config, config.modRequest.projectRoot);
//       const output = exec(); // the default is 'buffer'
//       console.log("Output was:\n", output);
//       return config;
//     },
//   ]);
// };
// export const withAndroidAssets: ConfigPlugin = (config) => {
//   return withDangerousMod(config, [
//     "android",
//     async (config) => {
//       // No modifications are made to the config
//       // await setIconsAsync(config, config.modRequest.projectRoot);
//       const output = execSync("ls", { encoding: "utf-8" }); // the default is 'buffer'
//       console.log("Output was:\n", output);
//       return config;
//     },
//   ]);
// };
/**
 * Apply VectorImage configuration for Expo SDK 42 projects.
 */
const withVectorImage = (config) => {
    config = withAndroidPlugin(config);
    config = withIosPlugin(config);
    return config;
};
exports.default = withVectorImage;
