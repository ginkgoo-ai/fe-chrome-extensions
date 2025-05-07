/**
 * @description 全局变量管理器
 */
import packageJson from "../../../package.json";

class GlobalManager {
  static instance: GlobalManager | null = null;
  g_package_json!: typeof packageJson;
  g_webenv!: string;
  g_version!: string;
  g_versionInfo!: Record<string, any>;
  g_NEXT_TICK_DELAY!: number;
  g_isDev!: boolean;
  g_cacheSync!: Record<string, any>;
  g_isMac!: boolean;

  static getInstance(): GlobalManager {
    if (!this.instance) {
      this.instance = new GlobalManager();
      this.instance.g_package_json = packageJson;
      this.instance.g_webenv = import.meta.env.PROD ? "prod" : "dev";
      this.instance.g_version = this.instance.g_package_json.version;
      this.instance.g_versionInfo = {}; // src/popup/pages/Entry/index.tsx init
      this.instance.g_NEXT_TICK_DELAY = 100;
      this.instance.g_isDev = import.meta.env.MODE === "development";
      this.instance.g_cacheSync = {};
      this.instance.g_isMac = navigator?.platform?.toUpperCase()?.indexOf("MAC") >= 0;
    }
    return this.instance;
  }
}

export default GlobalManager.getInstance();
