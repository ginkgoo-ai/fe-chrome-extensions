import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Chrome Extension 最终build目录
export const CRX_OUTDIR = path.resolve(__dirname, "../build");

// 临时build background script的目录
export const CRX_BACKGROUND_OUTDIR = path.resolve(__dirname, "../_build_background");
// 临时build content script的目录
export const CRX_CONTENT_OUTDIR = path.resolve(__dirname, "../_build_content");
// 临时build options的目录
export const CRX_OPTIONS_OUTDIR = path.resolve(__dirname, "../_build_options");
// 临时build popup的目录
export const CRX_POPUP_OUTDIR = path.resolve(__dirname, "../_build_popup");
// 临时build side panel的目录
export const CRX_SIDEPANEL_OUTDIR = path.resolve(__dirname, "../_build_sidepanel");
