/*global chrome*/
// manifest.json的Permissions配置需添加declarativeContent权限
import { v4 as uuidv4 } from "uuid";
import BackgroundEventManager from "@/common/kits/BackgroundEventManager";

chrome.runtime.onInstalled.addListener((): void => {
  // 默认先禁止Page Action。如果不加这一句，则无法生效下面的规则
  chrome.action.disable();
  // chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
  //   // 设置规则
  //   let rule = {
  //     // 运行插件运行的页面URL规则
  //     conditions: [
  //       new chrome.declarativeContent.PageStateMatcher({
  //         pageUrl: {
  //           // 适配所有域名以"www."开头的网页
  //           // hostPrefix: 'www.'
  //           // 适配所有域名以".antgroup.com"结尾的网页
  //           // hostSuffix: '.antgroup.com',
  //           // 适配域名为"ant-design.antgroup.com"的网页
  //           // hostEquals: "ant-design.antgroup.com",
  //           // 适配https协议的网页
  //           // schemes: ["https", "http"],
  //         },
  //       }),
  //     ],
  //     actions: [new chrome.declarativeContent.ShowAction()],
  //   };
  //   // 整合所有规则
  //   const rules = [rule];
  //   // 执行规则
  //   chrome.declarativeContent.onPageChanged.addRules(rules);
  // });

  // 注册右键菜单项
  // chrome.contextMenus.create({});

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error: Error) => console.error(error));
});

chrome.runtime.onMessage.addListener(BackgroundEventManager.onMessage);

chrome.tabs.onUpdated.addListener(BackgroundEventManager.onTabsUpdated);

chrome.tabs.onActivated.addListener(BackgroundEventManager.onTabsActivated);

chrome.tabs.onRemoved.addListener(BackgroundEventManager.onTabsRemoved);

// chrome.contextMenus.onClicked.addListener(BackgroundEventManager.onContextMenusClick);

chrome.commands.onCommand.addListener(BackgroundEventManager.onCommandsCommand);

// chrome.webRequest.onCompleted.addListener(BackgroundEventManager.onWebRequestCompleted, { urls: ["<all_urls>"] });

chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
  port.onDisconnect.addListener((port) => {
    if (chrome.runtime.lastError) {
      console.log("[Ginkgoo] Background port.onDisconnect lastError:", chrome.runtime.lastError.message);
    }
    // console.log("[Ginkgoo] Background port.onDisconnect", port);
    BackgroundEventManager.connectList = BackgroundEventManager.connectList.filter((item) => {
      return item.port?.name !== port.name;
    });
  });

  BackgroundEventManager.connectList.push({
    port,
  });

  port.onMessage.addListener((message) => {
    try {
      BackgroundEventManager.onConnectCommon(message, port);
    } catch (error) {
      console.log("[Ginkgoo] Background onConnectCommon error:", error);
      if (chrome.runtime.lastError) {
        console.log("[Ginkgoo] Background onConnectCommon lastError:", chrome.runtime.lastError.message);
      }
    }
  });
});
