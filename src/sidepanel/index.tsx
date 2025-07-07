import { App, ConfigProvider, theme } from "antd";
import en_US from "antd/locale/en_US";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import GlobalManager from "@/common/kits/GlobalManager";
import Config from "@/common/kits/config";
import { globalRouters } from "@/sidepanel/router";
import { IRootStateType } from "@/sidepanel/types/redux";
import "./index.less";

export default function SidePanel(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { x_themeValue } = useSelector((state: IRootStateType) => state.appInfo);

  const colorPrimary = Config?.themeInfoDefault?.[x_themeValue]?.customStyle?.["--color-primary"] || "#0061fd";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handler);

    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgoo-sidepanel-background-sidepanel-mounted",
      });
    } catch (error) {
      console.log("[Ginkgoo] Sidepanel handleBtnStartClick error", error);
    }

    return () => {
      mediaQuery.removeEventListener("change", handler);
      try {
        GlobalManager.g_backgroundPort?.postMessage({
          type: "ginkgoo-sidepanel-background-sidepanel-destory",
        });
      } catch (error) {
        console.log("[Ginkgoo] Sidepanel handleBtnStartClick error", error);
      }
    };
  }, []);

  return (
    <ConfigProvider
      locale={en_US}
      componentSize="middle"
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary,
          colorBgContainer: isDarkMode ? "#2d2e35" : "#ffffff",
        },
        components: {
          Button: {
            borderRadius: 12,
            defaultBg: isDarkMode ? "oklch(26.9% 0 0)" : "#ffffff",
            // defaultColor: isDarkMode ? "oklch(26.9% 0 0)" : "#ffffff",
          },
          Input: {
            controlHeight: 36,
            borderRadius: 12,
            colorBorder: isDarkMode ? "#686868" : "#E1E1E2",
            fontSize: 14,
          },
          Select: {
            controlHeight: 36,
            borderRadius: 12,
            colorBorder: isDarkMode ? "#686868" : "#E1E1E2",
            fontSize: 14,
            padding: 12,
          },
          Form: {
            labelColor: isDarkMode ? "#a1a1a1" : "#1A1A1AB2",
            labelFontSize: 14,
          },
          Breadcrumb: {
            separatorMargin: 2,
            ...(isDarkMode
              ? {
                  lastItemColor: "#f0f0f0",
                  linkColor: "#0061fd",
                  separatorColor: "#f0f0f0",
                }
              : {}),
          },
          Modal: isDarkMode
            ? {
                contentBg: "#2d2e35",
                headerBg: "#2d2e35",
              }
            : {},
        },
      }}
    >
      <App
        className="h-screen w-screen bg-[#FFFFFF] dark:bg-[#0D1118]"
        style={{
          ["--color-primary" as string]: colorPrimary,
        }}
      >
        <RouterProvider router={globalRouters} />
      </App>
    </ConfigProvider>
  );
}
