import { App, ConfigProvider } from "antd";
import en_US from "antd/locale/en_US";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import GlobalManager from "@/common/kits/GlobalManager";
import Config from "@/common/kits/config";
import { globalRouters } from "@/sidepanel/router";
import { IRootStateType } from "@/sidepanel/types/redux";
import "./index.less";

export default function SidePanel(): JSX.Element {
  const { x_themeValue } = useSelector((state: IRootStateType) => state.appInfo);

  const colorPrimary = Config?.themeInfoDefault?.[x_themeValue]?.customStyle?.["--color-primary"] || "#1890ff";

  useEffect(() => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-background-sidepanel-mounted",
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleBtnStartClick error", error);
    }

    return () => {
      try {
        GlobalManager.g_backgroundPort?.postMessage({
          type: "ginkgo-sidepanel-background-sidepanel-destory",
        });
      } catch (error) {
        console.error("[Ginkgo] Sidepanel handleBtnStartClick error", error);
      }
    };
  }, []);

  return (
    <ConfigProvider
      locale={en_US}
      componentSize="middle"
      theme={{
        token: {
          colorPrimary,
        },
      }}
    >
      <App
        className="h-screen w-screen"
        style={{
          ["--color-primary" as string]: colorPrimary,
        }}
      >
        <RouterProvider router={globalRouters} />
      </App>
    </ConfigProvider>
  );
}
