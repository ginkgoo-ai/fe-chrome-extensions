import { App, ConfigProvider } from "antd";
import en_US from "antd/locale/en_US";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import Config from "@/common/kits/config";
import { globalRouters } from "@/popup/router";
import { IRootStateType } from "@/popup/types/redux.d";
import "./index.less";
import "./styles/iconfont.css";

export default function Popup(): JSX.Element {
  const { x_themeValue } = useSelector((state: IRootStateType) => state.appInfo);

  return (
    <ConfigProvider
      locale={en_US}
      componentSize="small"
      theme={{
        token: {
          // Seed Token，影响范围大
          colorPrimary: Config?.themeInfoDefault?.[x_themeValue]?.customStyle?.["--color-primary"] || "#1890ff",
        },
      }}
    >
      <App>
        <div className="popupWrap">
          <RouterProvider router={globalRouters} />
        </div>
      </App>
    </ConfigProvider>
  );
}
