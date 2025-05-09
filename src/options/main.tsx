import { message } from "antd";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import ChromeManager from "@/common/kits/ChromeManager";
import GlobalManager from "@/common/kits/GlobalManager";
import "@/common/styles/frame.less";
import Options from "@/options";
import configStore from "@/options/redux/store";

if (GlobalManager.g_isDev) {
  import("@/content")
    // eslint-disable-next-line no-unused-vars
    .then((module) => {})
    // eslint-disable-next-line no-unused-vars
    .catch((err) => {});
}

message.config({
  // top: 500,
  // duration: 2,
  // maxCount: 3,
  prefixCls: "fe-chrome-extensions-message",
});

const store = configStore();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <Provider store={store}>
    <Options />
  </Provider>
);
