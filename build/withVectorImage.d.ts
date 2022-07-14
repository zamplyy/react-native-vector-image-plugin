import { ConfigPlugin, ExportedConfigWithProps, XcodeProject } from "@expo/config-plugins";
export declare enum GenerateCommands {
    EntryFile = "--entry-file",
    Config = "--config",
    ResetCache = "--reset-cache"
}
export declare const addStripSvgsImplementation: (projectBuildGradle: string) => string;
export declare const setPBXShellScriptBuildPhaseStripSvg: (config: ExportedConfigWithProps<XcodeProject>) => Promise<ExportedConfigWithProps<any>>;
export declare const getCommands: (commands?: {
    command: GenerateCommands;
    input: string;
}[]) => string;
export declare const withGenerateIosAssets: ConfigPlugin<string | void>;
export declare const withGenerateAndroidAssets: ConfigPlugin<string | void>;
/**
 * Apply VectorImage configuration for Expo SDK 42 projects.
 */
declare const withVectorImage: ConfigPlugin<{
    isMonorepo: boolean;
    customMetroConfigFile: string;
    resetCache: boolean;
    customEntryFile: string;
} | void>;
export default withVectorImage;
