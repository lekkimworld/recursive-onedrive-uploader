const {walk, exec} = require("./looper.js");

const BELLEVUE_STRAND = "55.7774933, 12.5863726";
const CHRISTIANSBORG = "55.6764633, 12.5784328,";
const HOERSHOLM_KIRKE = "55.875382449099, 12.500496236627";
const HOME = "55.919005, 12.440308";
const LISELEJE = "56.01316000N,11.96504500E";
const HOLTE = "55.802847 N, 12.467151 E";
const GENTOFTE_HOSPITAL = "55.736830386, 12.541164502";
const ctx = {
  data: {
    "GPSPosition": HOME
  },
  filenameDate: true,
  offset: 0,
  staticDate: "2016-07-02 12:00:00"
}

const onFile = async (fullPath, subPath, file, ctx) => {
  if (file === ".DS_Store") {
    console.log(`Ignoring .DS_Store file`);
    return;
  }
  if (
    file.toLowerCase().indexOf(".jpg") < 0 &&
    file.toLowerCase().indexOf(".jpeg") < 0 &&
    file.toLowerCase().indexOf(".heic") < 0
  ) {
    console.log(`Ignoring non-JPG/HEIC file (${file})`);
    return;
  }
  console.log("---");
  console.log(`Full path: ${fullPath}`);
  console.log(`Sub path : ${subPath}`);
  console.log(`File     : ${file}`);
  if (ctx.staticDate && ctx.staticDate.length) {
    var date = ctx.staticDate;
  } else if (ctx.filenameDate) {
    const year = file.substring(ctx.offset + 0, ctx.offset + 4);
    const month = file.substring(ctx.offset + 4, ctx.offset + 6);
    const day = file.substring(ctx.offset + 6, ctx.offset + 8);
    const hour = file.substring(ctx.offset + 9, ctx.offset + 11);
    const minute = file.substring(ctx.offset + 11, ctx.offset + 13);
    const second = file.substring(ctx.offset + 13, ctx.offset + 15);
    var date = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
  var keys = [];
  if (date) {
    keys.push(`"-EXIF:DateTimeOriginal=${date}"`);
    keys.push(`"-FileCreateDate=${date}"`);
    keys.push(`"-FileModifyDate=${date}"`);
  }
  if (ctx.data && typeof ctx.data === "object") {
    Object.keys(ctx.data).forEach(async key => {
        keys.push(`"-${key}=${ctx.data[key]}"`);
    })
  }
  if (keys.length) {
    await exec(
      `exiftool -overwrite_original ${keys.join(" ")} "${fullPath}"`
    );
  }
}

const onEnterDirectory = async (newFolder, ctx) => {
  console.log(`Entered directory: ${newFolder}`);
}

// get start path
const uploadPath = process.argv[2];
walk(uploadPath, onFile, onEnterDirectory, ctx);
