import { GenerateCommands, getCommands } from "../../withVectorImage";

describe("command generation", () => {
  // it(`adds string`, async () => {
  //   const sampleBuildGradle = await fs.readFile(
  //     resolve(__dirname, "./fixtures/build.gradle"),
  //     {
  //       encoding: "utf-8",
  //     }
  //   );
  //   const buildGradle = await addStripSvgsImplementation(sampleBuildGradle);
  //   const addString =
  //     'apply from: "../../node_modules/react-native-vector-image/strip_svgs.gradle"';
  //   expect(buildGradle.includes(addString)).toEqual(true);
  // });
  it("generates list of commands correct", async () => {
    const defaultCommands = getCommands();
    const customCommands1 = getCommands([
      { command: GenerateCommands.Config, input: "metro2.config.js" },
    ]);
    const customCommands2 = getCommands([
      { command: GenerateCommands.EntryFile, input: "app.js" },
    ]);
    const customCommands3 = getCommands([
      { command: GenerateCommands.ResetCache, input: "true" },
    ]);
    const customCommands4 = getCommands([
      { command: GenerateCommands.ResetCache, input: "true" },
      { command: GenerateCommands.EntryFile, input: "app.js" },
      { command: GenerateCommands.Config, input: "metro2.config.js" },
    ]);
    expect(defaultCommands).toEqual(
      "--entry-file index.js --config metro.config.js --reset-cache false"
    );
    expect(customCommands1).toEqual(
      "--config metro2.config.js --entry-file index.js --reset-cache false"
    );
    expect(customCommands2).toEqual(
      "--entry-file app.js --config metro.config.js --reset-cache false"
    );
    expect(customCommands3).toEqual(
      "--reset-cache true --entry-file index.js --config metro.config.js"
    );
    expect(customCommands4).toEqual(
      "--reset-cache true --entry-file app.js --config metro2.config.js"
    );
  });
});
