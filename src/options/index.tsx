import { App, ConfigProvider } from "antd";
import en_US from "antd/locale/en_US";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import Config from "@/common/kits/config";
import { globalRouters } from "@/options/router";
import { IRootStateType } from "@/options/types/redux.d";
import "./index.less";

export default function Options(): JSX.Element {
  const { x_themeValue } = useSelector((state: IRootStateType) => state.appInfo);

  return (
    <ConfigProvider
      locale={en_US}
      componentSize="middle"
      theme={{
        token: {
          colorPrimary: Config?.themeInfoDefault?.[x_themeValue]?.customStyle?.["--color-primary"] || "#1890ff",
        },
      }}
    >
      <App className="h-screen w-screen">
        <RouterProvider router={globalRouters} />
      </App>
    </ConfigProvider>
  );
}
