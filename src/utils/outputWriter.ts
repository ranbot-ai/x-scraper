const path = require("path");
const fs = require("fs-extra");

const outputsDir = path.resolve(__dirname, "./../../outputs");

const writeOutput = (identifier: string, data: any) => {
  fs.ensureDirSync(outputsDir);
  const filePath = path.join(outputsDir, `${identifier}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
};

export { writeOutput };
