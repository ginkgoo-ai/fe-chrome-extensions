import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { CRX_OPTIONS_OUTDIR, __dirname } from "./config";

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, "../src/options"),
  base: "/options/",
  build: {
    // 指定build输出目录
    outDir: CRX_OPTIONS_OUTDIR,
    // 设置代码分割配置
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 React 相关代码打包到单独的 chunk
          "vendor-react": ["react", "react-dom"],
          // 将第三方库打包到单独的 chunk  "lodash", "axios"
          "vendor": [],
        },
      },
    },
    // 调整 chunk 大小警告限制
    chunkSizeWarningLimit: 500,
  },
  server: {
    // 指定dev sever的端口号
    port: 19001,
    // 自动打开浏览器运行以下页面
    open: "/",
    // 设置反向代理
    proxy: {
      // 以下示例表示：请求URL中含有"/api"，则反向代理到http://localhost
      // 例如: http://localhost:3000/api/login -> http://localhost/api/login
      // 如果反向代理到localhost报错Error: connect ECONNREFUSED ::1:80，
      // 则将localhost改127.0.0.1
      // "/api": {
      //   target: "http://localhost/",
      //   changeOrigin: true,
      // },
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
