import { App, ConfigProvider } from "antd";
import en_US from "antd/locale/en_US";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import Config from "@/common/kits/config";
import { IRootStateType } from "@/sidepanel/redux/types";
import { globalRouters } from "@/sidepanel/router";
import "./index.less";
import "./styles/iconfont.css";

export default function SidePanel(): JSX.Element {
  const { x_themeValue } = useSelector((state: IRootStateType) => state.appInfo);

  const colorPrimary = Config?.themeInfoDefault?.[x_themeValue]?.customStyle?.["--color-primary"] || "#1890ff";

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
