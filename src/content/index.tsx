import { v4 as uuidv4 } from "uuid";
import GlobalManager from "@/common/kits/GlobalManager";
import "./index.less";

let port: chrome.runtime.Port | null = null;

const handleMessage = (event: MessageEvent) => {
  const message = event.data;
  const { type, ...otherInfo } = message;
  const [_, source, target] = type.split("-");
  // console.log("[Ginkgo] ContentScript handleMessage", event, type, type.startsWith("ginkgo-page-"));

  // 如果是自身来源的消息，才会转发
  if (source === "page") {
    switch (type) {
      default: {
        if (port?.name) {
          try {
            port?.postMessage(message);
          } catch (error) {
            console.debug("[Ginkgo] ContentScript postMessage error", error);
          }
        }
        break;
      }
    }
  }
};

const handleConnectMessage = (message: any, port: chrome.runtime.Port) => {
  // console.log("[Ginkgo] ContentScript handleConnectMessage", message, window.location.origin);
  const { type, scope } = message;
  const [_, source, target] = type.split("-");

  if (!scope || scope.includes(port.name)) {
    // 如果有指定送达范围，则只送达指定范围
    switch (type) {
      default: {
        window.postMessage(message, window.location.origin);
        break;
      }
    }
  }
  // if (target === "background") {
  //   port?.postMessage(message);
  // }
};

window.addEventListener("load", () => {
  try {
    // 仅白名单网站才会注入脚本
    if (!GlobalManager.g_whiteListForRegister.includes(window.location.origin)) {
      console.log("[Ginkgo] fe-chrome-extensions ignore");
      return;
    }

    console.log("[Ginkgo] fe-chrome-extensions load");

    // 注册监听页面事件
    window.addEventListener("message", handleMessage);

    // 注册监听background事件
    port = chrome.runtime.connect({ name: `ginkgo-page-${uuidv4()}` });
    port.onMessage.addListener(handleConnectMessage);
  } catch (error) {
    console.debug("[Ginkgo] Error in load event:", error);
  }
});

// 添加页面卸载前的清理逻辑
window.addEventListener("beforeunload", () => {
  window.removeEventListener("message", handleMessage);
});

// window.addEventListener("unload", () => {
//   window.removeEventListener("message", handleMessage);
// });

// function Content(): JSX.Element {
//   const [isShowModalVisible, setShowModalVisible] = useState(false);

//   const handleBtnClick = (): void => {
//     setShowModalVisible(true);
//   };

//   const handleModalClose = (): void => {
//     setShowModalVisible(false);
//   };

//   return (
//     <div className="CRX-content">
//       <div className="content-entry" onClick={handleBtnClick}></div>
//       {isShowModalVisible ? <MKMainModal onClose={handleModalClose} /> : null}
//     </div>
//   );
// }

// // 创建id为CRX-container的div
// const app = document.createElement("div");
// app.id = "CRX-container";
// // 将刚创建的div插入body最后
// document.body.appendChild(app);
// // 将ReactDOM插入刚创建的div
// const crxContainer = ReactDOM.createRoot(document.getElementById("CRX-container")!);
// crxContainer.render(<Content />);

// // 向目标页面驻入js
// try {
//   let insertScript = document.createElement("script");
//   insertScript.setAttribute("type", "text/javascript");
//   // insertScript.src = window.chrome.runtime.getURL("insert.js");
//   insertScript.src = ChromeManager.getURLRuntime("insert.js");
//   document.body.appendChild(insertScript);
// } catch (err) {}

// 监听复制操作
// try {
//   document.addEventListener("copy", (event: ClipboardEvent) => {
//     // 获取被复制的文本内容
//     const clipboardData = event.clipboardData || window.clipboardData;
//     if (!clipboardData || !clipboardData.items) {
//       console.log("暂不支持复制");
//       return;
//     }
//     const text = clipboardData.getData("text");
//     console.log("得到复制内容", text);
//   });
// } catch (err) {}

// window.addEventListener("load", () => {
//   try {
//     // 访问window对象上的数据
//     const info = window.DEBUG_TEST;

//     // 将数据发送到插件的background脚本
//     ChromeManager.sendMessageRuntime({
//       type: "test",
//       info,
//     });
//     console.log("0000", info);
//   } catch (error) {
//     console.log("0000 error", error);
//   }
// });
