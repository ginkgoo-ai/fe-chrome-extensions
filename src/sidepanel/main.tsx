import "@ant-design/v5-patch-for-react-19";
import { message } from "antd";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import ChromeManager from "@/common/kits/ChromeManager";
import EventManager from "@/common/kits/EventManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UtilsManager from "@/common/kits/UtilsManager";
import "@/common/styles/frame.less";
import SidePanel from "@/sidepanel";
import configStore from "@/sidepanel/redux/store";

const main = async () => {
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
      <SidePanel />
    </Provider>
  );

  // 注册监听 Background 消息
  // chrome?.runtime?.onMessage?.addListener(async (request, sender, sendResponse) => {
  //   if (request.type === "onTabsComplete") {
  //     const resTabInfo = await ChromeManager.getActiveTabInfo();
  //     if (resTabInfo.id !== request?.tabInfo?.id) {
  //       return;
  //     }
  //     // 可以将 HTML 内容存储到 Redux store 中
  //     // store.dispatch({
  //     //   type: "UPDATE_TAB_ACTIVATED",
  //     //   payload: resTabInfo,
  //     // });
  //   }
  //   sendResponse(true);
  //   return true;
  // });

  // 注册监听 Background 消息
  GlobalManager.g_handleBackgroundMessage = async (message: any, port: chrome.runtime.Port) => {
    // console.log("GlobalManager.g_handleBackgroundMessage", message);
    const { type, scope } = message || {};
    if (!scope || scope.includes(port.name)) {
      // 如果有指定送达范围，则只送达指定范围
      switch (type) {
        case "ginkgoo-background-all-tab-complete": {
          const { tabInfo } = message || {};
          const { origin } = UtilsManager.getUrlInfo(tabInfo?.url);
          if (GlobalManager.g_whiteListForRegister.includes(origin)) {
            EventManager.emit("ginkgoo-extensions", message);
          }
          break;
        }
        case "ginkgoo-background-all-tab-activated": {
          store.dispatch({
            type: "UPDATE_TAB_ACTIVATED",
            payload: message?.tabInfo,
          });
          EventManager.emit("ginkgoo-extensions", message);
          break;
        }
        default: {
          EventManager.emit("ginkgoo-extensions", message);
          break;
        }
      }
    }
  };
  GlobalManager.connectBackground();
};

main();
