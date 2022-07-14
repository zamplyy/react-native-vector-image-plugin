"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withGenerateAndroidAssets = exports.withGenerateIosAssets = exports.setPBXShellScriptBuildPhaseStripSvg = exports.addStripSvgsImplementation = void 0;
const config_plugins_1 = require("@expo/config-plugins");
let MONO_REPO = false;
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
const getCliPath = (projectRoot) => {
    let cliPath;
    if (MONO_REPO) {
        cliPath =
            projectRoot +
                "/../../node_modules/react-native-vector-image/src/cli/index";
    }
    else {
        cliPath =
            projectRoot + "/node_modules/react-native-vector-image/src/cli/index";
    }
    return cliPath;
};
const withGenerateIosAssets = (config) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const appName = config.modRequest.projectName;
            const cliPath = getCliPath(config.modRequest.projectRoot);
            const cli = require(cliPath);
            if (cli !== undefined || cli !== null) {
                cli(`generate --ios-output ios/${appName}/Images.xcassets --no-android-output`);
            }
            return config;
        },
    ]);
};
exports.withGenerateIosAssets = withGenerateIosAssets;
const withGenerateAndroidAssets = (config) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            const cliPath = getCliPath(config.modRequest.projectRoot);
            const cli = require(cliPath);
            if (cli !== undefined || cli !== null) {
                cli(`generate --no-ios-output`);
            }
            return config;
        },
    ]);
};
exports.withGenerateAndroidAssets = withGenerateAndroidAssets;
/**
 * Apply VectorImage configuration for Expo SDK 42 projects.
 */
const withVectorImage = (config, props) => {
    var _a;
    MONO_REPO = (_a = props === null || props === void 0 ? void 0 : props.isMonorepo) !== null && _a !== void 0 ? _a : false;
    config = withAndroidPlugin(config);
    config = withIosPlugin(config);
    config = (0, exports.withGenerateIosAssets)(config);
    config = (0, exports.withGenerateAndroidAssets)(config);
    return config;
};
exports.default = withVectorImage;
