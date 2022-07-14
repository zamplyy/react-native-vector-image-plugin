import {
  ConfigPlugin,
  withAppBuildGradle,
  ExportedConfigWithProps,
  XcodeProject,
  withXcodeProject,
  withDangerousMod,
} from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";
let MONO_REPO = false;

export const addStripSvgsImplementation = (projectBuildGradle: string) => {
  const addString = `apply from: new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim(), "../../react-native-vector-image/strip_svgs.gradle")`;
  const searchString = /"..\/react.gradle"\)\n/gm;

  if (projectBuildGradle.includes(addString)) {
    return projectBuildGradle;
  }

  return projectBuildGradle.replace(
    searchString,
    `"../react.gradle")\n${addString}`
  );
};

const withAndroidPlugin: ConfigPlugin = (config: ExpoConfig) => {
  return withAppBuildGradle(config, ({ modResults, ...config }) => {
    modResults.contents = addStripSvgsImplementation(modResults.contents);
    return { modResults, ...config };
  });
};

const addSlashes = (str: string) => {
  return str.replace(/[\\"]/g, "\\$&").replace(/\u0000/g, "\\0");
};

export const setPBXShellScriptBuildPhaseStripSvg = async (
  config: ExportedConfigWithProps<XcodeProject>
) => {
  const xcodeProject = config.modResults;
  const pbxShellScriptBuildPhases =
    xcodeProject.hash.project.objects.PBXShellScriptBuildPhase;
  for (const buildPhase of Object.values<{ name: string; shellScript: string }>(
    pbxShellScriptBuildPhases
  )) {
    if (
      buildPhase?.name === '"Bundle React Native code and images"' &&
      !buildPhase?.shellScript.includes('"react-native-vector-image"')
    ) {
      const parts = [
        'export NODE_BINARY=node\\n\\n# The project root by default is one level up from the ios directory\\nexport PROJECT_ROOT=\\"$PROJECT_DIR\\"/..\\n\\n',
        addSlashes(
          `\`node --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"\``
        ),
        addSlashes(
          `\`node --print "require('path').dirname(require.resolve('react-native/package.json')) + '/../react-native-vector-image/strip_svgs.sh'"\``
        ),
      ];
      buildPhase.shellScript = `\"${parts.join("\\n")}\"`;
    }
  }
  return config;
};

const withIosPlugin: ConfigPlugin = (c: ExpoConfig) => {
  return withXcodeProject(c, async (config) => {
    config = await setPBXShellScriptBuildPhaseStripSvg(config);
    return config;
  });
};

const getCliPath = (projectRoot: string) => {
  let cliPath;
  if (MONO_REPO) {
    cliPath =
      projectRoot +
      "/../../node_modules/react-native-vector-image/src/cli/index";
  } else {
    cliPath =
      projectRoot + "/node_modules/react-native-vector-image/src/cli/index";
  }
  return cliPath;
};

export const withGenerateIosAssets: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const appName = config.modRequest.projectName;
      const cliPath = getCliPath(config.modRequest.projectRoot);
      const cli = require(cliPath);
      if (cli !== undefined || cli !== null) {
        cli(
          `generate --ios-output ios/${appName}/Images.xcassets --no-android-output`
        );
      }
      return config;
    },
  ]);
};
export const withGenerateAndroidAssets: ConfigPlugin = (config) => {
  return withDangerousMod(config, [
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

/**
 * Apply VectorImage configuration for Expo SDK 42 projects.
 */
const withVectorImage: ConfigPlugin<{ isMonorepo: boolean } | void> = (
  config,
  props
) => {
  MONO_REPO = props?.isMonorepo ?? false;
  config = withAndroidPlugin(config);
  config = withIosPlugin(config);
  config = withGenerateIosAssets(config);
  config = withGenerateAndroidAssets(config);
  return config;
};

export default withVectorImage;
