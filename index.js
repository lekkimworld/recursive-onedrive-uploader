const fs = require('fs').promises;
const path = require('path');
const {exec} = require("child_process");

const promisifiedExec = async (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error)
      resolve(stdout)
    })
  })
}

const processFile = async (basePath, subPath, file) => {
  if (file === ".DS_Store") return;
  const fullPath = path.join(basePath, subPath, file);
  console.log("---");
  console.log(`Full path: ${fullPath}`);
  console.log(`Sub path : ${subPath}`);
  console.log(`File     : ${file}`);
  await promisifiedExec(`onedrive-uploader -q upload "${fullPath}" "${subPath.length ? subPath : "/"}"`);
}

const walk = async (baseDir, subPath) => {
  if (subPath.length > 0) {
    const newFolder = subPath.substring(1);
    await promisifiedExec(`onedrive-uploader -q mkdir "${newFolder}"`);
  }

  try {
    // list files
    const files = await fs.readdir(path.join(baseDir, subPath));
    for (let idx in files) {
      const file = files[idx];
      const s = await fs.stat(path.join(baseDir, subPath, file));
      if (s.isFile()) {
        await processFile(baseDir, subPath, file);
      }
    }
    for (let idx in files) {
      const file = files[idx];
      const s = await fs.stat(path.join(baseDir, subPath, file));
      if (s.isDirectory()) {
        await walk(baseDir, `${subPath}/${file}`);
      }
    }    
    
  } catch (e) {
    console.log(e);
  };
};

const loop = (baseDir) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!(await fs.stat(baseDir)).isDirectory()) {
        console.log(`${baseDir} is not a directory`);
        process.exit(1);
      }
    } catch (e) {
      console.log(`Error stat'ing ${baseDir}: ${e.message}`);
      process.exit(1);
    }
    const files = await fs.readdir(baseDir);
    for (let idx in files) {
      const file = files[idx];
      const s = await fs.stat(path.join(baseDir, file));
      if (s.isFile()) {
        await processFile(baseDir, "", file);
      }
    }
    for (let idx in files) {
      const file = files[idx];
      const s = await fs.stat(path.join(baseDir, file));
      if (s.isDirectory()) {
        await walk(baseDir, `/${file}`);
      }
    }
    resolve();
  })
  
}
const uploadPath = process.argv[2];
loop(uploadPath).then(() => {

});

