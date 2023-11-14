const {walk, exec} = require("./looper.js");

const onFile = async (fullPath, subPath, file, ctx) => {
  if (file === ".DS_Store") return;
  console.log("---");
  console.log(`Full path: ${fullPath}`);
  console.log(`Sub path : ${subPath}`);
  console.log(`File     : ${file}`);
  await exec(`onedrive-uploader -q upload "${fullPath}" "${subPath.length ? subPath : "/"}"`);
}

const onEnterDirectory = async (newFolder, ctx) => {
  await exec(`onedrive-uploader -q mkdir "${newFolder}"`);
}

// get start path
const uploadPath = process.argv[2];
walk(uploadPath, onFile, onEnterDirectory, {});
