import { execSync } from "child_process";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取 __dirname 等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取时间戳
const timestamp = dayjs().format("YYYYMMDD_HHmmss");
const buildDir = path.join(__dirname, "../build");
const newDirName = `fe-chrome-extensions-v${timestamp}`;
const newDirPath = path.join(__dirname, `../${newDirName}`);

// 确保build目录存在
if (!fs.existsSync(buildDir)) {
  console.error("Error: build目录不存在！");
  process.exit(1);
}

try {
  // 重命名build目录
  fs.renameSync(buildDir, newDirPath);
  console.log(`已将build目录重命名为 ${newDirName}`);

  // 使用zip命令进行压缩
  const zipCommand = `cd "${path.dirname(newDirPath)}" && zip -r "${newDirName}.zip" "${newDirName}"`;
  execSync(zipCommand);
  console.log(`已成功创建 ${newDirName}.zip`);

  // 完成后将文件夹名改回build
  fs.renameSync(newDirPath, buildDir);
  console.log("已恢复build目录名称");
} catch (error) {
  console.error("部署过程中发生错误：", error);
  // 如果发生错误，尝试恢复build目录名称
  if (fs.existsSync(newDirPath)) {
    fs.renameSync(newDirPath, buildDir);
  }
  process.exit(1);
}
