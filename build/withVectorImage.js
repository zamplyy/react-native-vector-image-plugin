"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withGenerateAndroidAssets = exports.withGenerateIosAssets = exports.getCommands = exports.setPBXShellScriptBuildPhaseStripSvg = exports.addStripSvgsImplementation = exports.GenerateCommands = void 0;
const config_plugins_1 = require("@expo/config-plugins");
let MONO_REPO = false;
var GenerateCommands;
(function (GenerateCommands) {
    GenerateCommands["EntryFile"] = "--entry-file";
    GenerateCommands["Config"] = "--config";
    GenerateCommands["ResetCache"] = "--reset-cache";
})(GenerateCommands = exports.GenerateCommands || (exports.GenerateCommands = {}));
const DefaultCommands = [
    {
        command: GenerateCommands.EntryFile,
        input: "index.js",
    },
    {
        command: GenerateCommands.Config,
        input: "metro.config.js",
    },
    {
        command: GenerateCommands.ResetCache,
        input: "false",
    },
];
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
            // eslint-disable-next-line no-useless-escape
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
const getCommands = (commands = DefaultCommands) => {
    const commandsMap = new Map();
    commands.forEach((c) => commandsMap.set(c.command, c.input));
    DefaultCommands.forEach((c) => {
        const exists = commandsMap.has(c.command);
        if (!exists) {
            commandsMap.set(c.command, c.input);
        }
    });
    return Array.from(commandsMap)
        .map((arr) => `${arr[0]} ${arr[1]}`)
        .join(" ");
};
exports.getCommands = getCommands;
const withGenerateIosAssets = (config, commands) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "ios",
        async (config) => {
            const appName = config.modRequest.projectName;
            const cliPath = getCliPath(config.modRequest.projectRoot);
            const cli = require(cliPath);
            if (cli !== undefined || cli !== null) {
                cli(`generate --ios-output ios/${appName}/Images.xcassets --no-android-output ${commands}`);
            }
            return config;
        },
    ]);
};
exports.withGenerateIosAssets = withGenerateIosAssets;
const withGenerateAndroidAssets = (config, commands) => {
    return (0, config_plugins_1.withDangerousMod)(config, [
        "android",
        async (config) => {
            const cliPath = getCliPath(config.modRequest.projectRoot);
            const cli = require(cliPath);
            if (cli !== undefined || cli !== null) {
                cli(`generate --no-ios-output ${commands}`);
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
    const commands = [];
    if (props === null || props === void 0 ? void 0 : props.customEntryFile) {
        commands.push({
            command: GenerateCommands.EntryFile,
            input: props === null || props === void 0 ? void 0 : props.customEntryFile,
        });
    }
    if (props === null || props === void 0 ? void 0 : props.customMetroConfigFile) {
        commands.push({
            command: GenerateCommands.Config,
            input: props === null || props === void 0 ? void 0 : props.customMetroConfigFile,
        });
    }
    if (props === null || props === void 0 ? void 0 : props.resetCache) {
        commands.push({
            command: GenerateCommands.ResetCache,
            input: `${props === null || props === void 0 ? void 0 : props.resetCache}`,
        });
    }
    const commandsWithDefault = (0, exports.getCommands)();
    config = withAndroidPlugin(config);
    config = withIosPlugin(config);
    config = (0, exports.withGenerateIosAssets)(config, commandsWithDefault);
    config = (0, exports.withGenerateAndroidAssets)(config, commandsWithDefault);
    return config;
};
exports.default = withVectorImage;
