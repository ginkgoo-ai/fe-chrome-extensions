import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { CRX_CONTENT_OUTDIR, __dirname } from "./config";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: CRX_CONTENT_OUTDIR,
    lib: {
      entry: [path.resolve(__dirname, "../src/content/index.tsx")],
      // content script不支持ES6，因此不用使用es模式，需要改为cjs模式
      formats: ["cjs"],
      // 设置生成文件的文件名
      fileName: () => {
        // 将文件后缀名强制定为js，否则会生成cjs的后缀名
        return "content.js";
      },
    },
    rollupOptions: {
      output: {
        // eslint-disable-next-line no-unused-vars
        assetFileNames: (assetInfo) => {
          // 附属文件命名，content script会生成配套的css
          return "content.css";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  // 解决react代码中包含process.env.NODE_ENV导致无法使用的问题
  define: {
    "process.env.NODE_ENV": null,
  },
  plugins: [react()],
});
