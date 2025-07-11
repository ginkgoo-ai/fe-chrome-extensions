import fs from "fs";
import path from "path";
import process from "process";
import {
  CRX_BACKGROUND_OUTDIR,
  CRX_CONTENT_OUTDIR,
  CRX_OPTIONS_OUTDIR,
  CRX_OUTDIR,
  CRX_POPUP_OUTDIR,
  CRX_SIDEPANEL_OUTDIR,
} from "./config.js";

const copyAndReplaceFile = async (srcPath, destPath, searchString, replaceString) => {
  try {
    // 读取源文件内容
    const data = fs.readFileSync(srcPath, "utf8");
    // 替换文件内容
    const replacedData = data
      .replace(searchString, replaceString)
      // 替换单行注释
      .replace(/\/\/ .*$/gm, "");

    // 将替换后的内容写入目标文件
    fs.writeFileSync(destPath, replacedData, "utf8");
    return;
  } catch (err) {
    console.error("copyAndReplaceFile Error", err);
  }
};

// 拷贝目录文件
const copyDirectory = (srcDir, destDir) => {
  // 检查源目录是否存在
  if (!fs.existsSync(srcDir)) {
    console.warn(`Warning: Source directory ${srcDir} does not exist, skipping copy.`);
    return;
  }

  // 判断目标目录是否存在，不存在则创建
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.readdirSync(srcDir).forEach((file) => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      // 递归复制子目录
      copyDirectory(srcPath, destPath);
    } else {
      // Copy files
      if (file === "manifest.json") {
        // Replace version number and remove key field for production build
        copyAndReplaceFile(srcPath, destPath, /"version": ".*"/, `"version": "${process.env.npm_package_version}"`);

        // Remove key field from manifest.json for Chrome Web Store compatibility
        // TODO: The "key" field is used to lock the extension ID, which is required for backend login/cross-origin configuration. When publishing to the Chrome Web Store in the future, locking the extension ID will need to be achieved by packaging with a private key.

        // const manifestContent = fs.readFileSync(destPath, "utf8");
        // const manifestJson = JSON.parse(manifestContent);
        // if (manifestJson.key) {
        //   delete manifestJson.key;
        //   fs.writeFileSync(destPath, JSON.stringify(manifestJson, null, 2));
        // }
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  });
};

// 删除目录及文件
const deleteDirectory = (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach((file) => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // 递归删除子目录
        deleteDirectory(curPath);
      } else {
        // 删除文件
        fs.unlinkSync(curPath);
      }
    });
    // 删除空目录
    fs.rmdirSync(dir);
  }
};

// 目标目录：Chrome Extension 最终build目录
const outDir = path.resolve(process.cwd(), CRX_OUTDIR);

// 源目录：background script临时生成目录
const backgroundOutDir = path.resolve(process.cwd(), CRX_BACKGROUND_OUTDIR);
// 源目录：content script临时生成目录
const contentOutDir = path.resolve(process.cwd(), CRX_CONTENT_OUTDIR);
// 源目录：options临时生成目录
const optionsOutDir = path.resolve(process.cwd(), CRX_OPTIONS_OUTDIR);
// 源目录：popup临时生成目录
const popupOutDir = path.resolve(process.cwd(), CRX_POPUP_OUTDIR);
// 源目录：side panel临时生成目录
const sidePanelOutDir = path.resolve(process.cwd(), CRX_SIDEPANEL_OUTDIR);

// 将复制源目录内的文件和目录全部复制到目标目录中
copyDirectory(backgroundOutDir, outDir);
copyDirectory(contentOutDir, outDir);
copyDirectory(optionsOutDir, `${outDir}/options`);
copyDirectory(popupOutDir, `${outDir}/popup`);
copyDirectory(sidePanelOutDir, `${outDir}/sidepanel`);

// 删除源目录
deleteDirectory(backgroundOutDir);
deleteDirectory(contentOutDir);
deleteDirectory(optionsOutDir);
deleteDirectory(popupOutDir);
deleteDirectory(sidePanelOutDir);
