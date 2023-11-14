const fs = require('fs').promises;
const path = require('path');
const {exec} = require("child_process");

module.exports = {
  exec: async (cmd) => {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) return reject(error)
        resolve(stdout)
      })
    })
  },

  walk: async (processPath, onFile, onEnterDirectory, ctx) => {

    /**
     * Function to walk the directory hierarchy.
     * 
     * @param {string} baseDir 
     * @param {string} subPath 
     */
    const recurseWalk = async (baseDir, subPath, ctx) => {
      if (subPath.length > 0) {
        // we entered a directory
        const newFolder = subPath.substring(1);
        await onEnterDirectory(newFolder, ctx);
      }

      try {
        // list files
        const files = await fs.readdir(path.join(baseDir, subPath));

        // loop and process files
        for (let idx in files) {
          const file = files[idx];
          const s = await fs.stat(path.join(baseDir, subPath, file));
          if (s.isFile()) {
            const fullPath = path.join(baseDir, subPath, file);
            await onFile(fullPath, subPath, file, ctx);
          }
        }

        // loop and process directories
        for (let idx in files) {
          const file = files[idx];
          const s = await fs.stat(path.join(baseDir, subPath, file));
          if (s.isDirectory()) {
            await recurseWalk(baseDir, `${subPath}/${file}`, ctx);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };

    /**
     * Function to start walking the directory hierarchy.
     * 
     * @param {string} baseDir 
     * @returns 
     */
    const startWalk = (baseDir, ctx) => {
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

        // get the files
        const files = await fs.readdir(baseDir);
        
        // loop and only process files
        for (let idx in files) {
          const file = files[idx];
          const s = await fs.stat(path.join(baseDir, file));
          if (s.isFile()) {
            const fullPath = path.join(baseDir, file);
            await onFile(fullPath, "", file, ctx);
          }
        }

        // loop and process directories
        for (let idx in files) {
          const file = files[idx];
          const s = await fs.stat(path.join(baseDir, file));
          if (s.isDirectory()) {
            await recurseWalk(baseDir, `/${file}`, ctx);
          }
        }
        resolve();
      });
    };

    // start walking
    return startWalk(processPath, ctx);
  }
};
