import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
// 全局样式
import GlobalManager from "@/common/kits/GlobalManager";
import "@/common/styles/frame.less";
import Popup from "@/popup";
import configStore from "@/popup/redux/store";

if (GlobalManager.g_isDev) {
  import("@/content")
    // eslint-disable-next-line no-unused-vars
    .then((module) => {})
    // eslint-disable-next-line no-unused-vars
    .catch((err) => {});
}

message.config({
  top: 500,
  duration: 2,
  maxCount: 3,
  rtl: true,
  prefixCls: "my-message",
});

const store = configStore();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// // 禁用 findDOMNode 警告
// const originalError = console.error;
// const originalWarn = console.warn;
// console.error = (...args) => {
//   if (typeof args[0] === "string" && (args[0].includes("findDOMNode") || args[0].includes("Warning: findDOMNode"))) {
//     return;
//   }
//   originalError.call(console, ...args);
// };
// console.warn = (...args) => {
//   if (typeof args[0] === "string" && (args[0].includes("findDOMNode") || args[0].includes("Warning: findDOMNode"))) {
//     return;
//   }
//   originalWarn.call(console, ...args);
// };

ReactDOM.createRoot(rootElement).render(
  <Provider store={store}>
    <Popup />
  </Provider>
);
