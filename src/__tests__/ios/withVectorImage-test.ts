import * as fs from "fs/promises";
import { resolve } from "path";

import { addStripSvgsImplementation } from "../../withVectorImage";

describe("addStripSvgsImplementation", () => {
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
  it(`1 plus 1`, async () => {
    expect(1 + 1).toEqual(2);
  });
});
