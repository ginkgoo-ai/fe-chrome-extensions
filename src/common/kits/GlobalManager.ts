/**
 * @description 全局变量管理器
 */
import packageJson from "../../../package.json";

class GlobalManager {
  static instance: GlobalManager | null = null;

  g_NEXT_TICK_DELAY!: number;
  g_API_CONFIG!: {
    authServerUrl: string;
    apiServerUrl: string;
    clientId: string;
    scope: string;
    responseType: string;
  };

  g_whiteListForRegister!: string[];

  g_cacheSync!: Record<string, any>;
  g_package_json!: typeof packageJson;
  g_webenv!: string;
  g_version!: string;
  g_versionInfo!: Record<string, any>;
  g_isDev!: boolean;
  g_isMac!: boolean;
  g_backgroundPort: chrome.runtime.Port | null = null;
  g_backgroundPortUuid: string = "";

  static getInstance(): GlobalManager {
    if (!this.instance) {
      this.instance = new GlobalManager();
      this.instance.g_NEXT_TICK_DELAY = 100;
      this.instance.g_API_CONFIG = {
        authServerUrl: "https://auth.ginkgoo.dev",
        apiServerUrl: "https://api.ginkgoo.dev/api",
        clientId: "ginkgoo-web-client",
        scope: "openid profile email",
        responseType: "code",
      };

      this.instance.g_cacheSync = {};
      this.instance.g_package_json = packageJson;
      this.instance.g_webenv = import.meta.env.PROD ? "prod" : "dev";
      this.instance.g_version = this.instance.g_package_json.version;
      this.instance.g_versionInfo = {}; // init in src/popup/pages/Entry/index.tsx
      this.instance.g_isDev = import.meta.env.MODE === "development";
      this.instance.g_isMac = navigator?.platform?.toUpperCase()?.indexOf("MAC") >= 0;
      this.instance.g_backgroundPort = null;
      this.instance.g_backgroundPortUuid = "";

      this.instance.g_whiteListForRegister = [
        "https://legal-dashboard.ginkgoo.dev", // Saas 页面
        "http://localhost:3000", // 开发页面
      ];
    }
    return this.instance;
  }
}

export default GlobalManager.getInstance();
