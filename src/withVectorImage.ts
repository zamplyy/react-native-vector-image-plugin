import {
  ConfigPlugin,
  withAppBuildGradle,
  ExportedConfigWithProps,
  XcodeProject,
  withXcodeProject,
  withDangerousMod,
} from "@expo/config-plugins";
import { ExpoConfig } from "@expo/config-types";
import { execSync, exec } from "child_process";

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
const withVectorImage: ConfigPlugin = (config) => {
  config = withAndroidPlugin(config);
  config = withIosPlugin(config);

  return config;
};

export default withVectorImage;
