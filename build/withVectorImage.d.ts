import { ConfigPlugin, ExportedConfigWithProps, XcodeProject } from "@expo/config-plugins";
export declare const addStripSvgsImplementation: (projectBuildGradle: string) => string;
export declare const setPBXShellScriptBuildPhaseStripSvg: (config: ExportedConfigWithProps<XcodeProject>) => Promise<ExportedConfigWithProps<any>>;
export declare const withGenerateIosAssets: ConfigPlugin;
export declare const withGenerateAndroidAssets: ConfigPlugin;
/**
 * Apply VectorImage configuration for Expo SDK 42 projects.
 */
declare const withVectorImage: ConfigPlugin<{
    isMonorepo: boolean;
} | void>;
export default withVectorImage;
