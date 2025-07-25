import { LoadingOutlined } from "@ant-design/icons";
import { message as messageAntd } from "antd";
import { Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import ChromeManager from "@/common/kits/ChromeManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import { IPilotType } from "@/common/types/casePilot";
import "./index.less";

interface SPPageCoreProps {
  track?: string;
  isEntry?: boolean;
  renderPageHeader?: () => React.ReactNode;
  renderPageFooter?: () => React.ReactNode;
  children: React.ReactNode;
}

/**
 * 页面容器组件
 */
export default function SPPageCore(props: SPPageCoreProps) {
  const { track, isEntry, renderPageHeader, renderPageFooter, children } = props || {};
  const { location, pathRouter, paramsRouter } = usePageParams();

  const locationRef = useRef(location);
  const pathRouterRef = useRef(pathRouter);
  const paramsRouterRef = useRef(paramsRouter);

  const pilotInfoCalcTrackRef = useRef<any>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEventManager("ginkgoo-extensions", async (message) => {
    const { type: typeMsg } = message;

    switch (typeMsg) {
      case "ginkgoo-background-all-auth-check": {
        const { value: valueMsg } = message;
        if (!valueMsg) {
          window.location.reload();
        }
        break;
      }
      case "ginkgoo-background-sidepanel-page-reload": {
        window.location.reload();
        break;
      }
      case "ginkgoo-background-all-tab-complete": {
        const { tabInfo } = message || {};

        redirectToPage({ tabInfo }, "tab-complete");
        break;
      }
      case "ginkgoo-background-all-tab-activated": {
        const { tabInfo } = message || {};

        redirectToPage({ tabInfo }, "tab-activated");
        break;
      }
      case "ginkgoo-background-all-pilot-query":
      case "ginkgoo-background-all-pilot-update": {
        const { pilotInfo: pilotInfoMsg, sourceMessage: sourceMessageMsg } = message || {};
        const { tabId: tabIdMsg } = sourceMessageMsg || {};

        if (!!tabIdMsg) {
          pilotInfoCalcTrackRef.current = {
            pilotInfo: pilotInfoMsg,
          };
        }
        break;
      }
      case "ginkgoo-background-all-toast": {
        const { typeToast, contentToast } = message || {};
        messageAntd.open({
          type: typeToast,
          content: contentToast,
        });
        console.log("ginkgoo-background-all-toast", typeToast, contentToast);

        break;
      }
      default: {
        break;
      }
    }
  });

  const calcTrack = async (params?: { tabInfo?: chrome.tabs.Tab }) => {
    // TODO: 获取当前页面
    // 如果是 case-detail 则跳转到对应 case 的 case-detail
    // 如果是 激活的 pilot ，则跳转对应 case 的 case-detail ，targetWorkflowId
    // 否则全部跳转到 case-portal
    const { tabInfo } = params || {};
    const activeTabInfo = tabInfo ? tabInfo : await ChromeManager.getActiveTabInfo();
    const { origin, path, searchParams } = UtilsManager.getUrlInfo(activeTabInfo.url);

    pilotInfoCalcTrackRef.current = null;

    GlobalManager.postMessage({
      type: "ginkgoo-sidepanel-background-pilot-query",
      tabId: activeTabInfo.id,
    });

    if (GlobalManager.g_whiteListForRegister.includes(origin) && path.endsWith("/case-detail")) {
      const caseId = (searchParams as URLSearchParams)?.get("caseId") || "";
      return UtilsManager.router2url("/case-detail", {
        caseId,
      });
    }

    for (let i = 0; ; i++) {
      if (!!pilotInfoCalcTrackRef.current) {
        break;
      }
      if (i >= 30) {
        return "";
      }
      await UtilsManager.sleep(200);
    }

    const caseId = (pilotInfoCalcTrackRef.current?.pilotInfo as IPilotType)?.pilotCaseInfo?.id || "";

    pilotInfoCalcTrackRef.current = null;
    if (!!caseId) {
      return UtilsManager.router2url("/case-detail", {
        caseId,
      });
    }

    return "/case-portal";
  };

  const redirectToPage = async (params?: { tabInfo?: chrome.tabs.Tab }, extend?: string) => {
    const newTrack = await calcTrack(params);
    if (!newTrack) {
      return;
    }
    const oldTrack = UtilsManager.router2url(pathRouterRef.current, paramsRouterRef.current);
    if (newTrack !== oldTrack) {
      UtilsManager.redirectTo(newTrack, {}, extend);
    }
  };

  const checkAuth = async () => {
    const isAuthenticatedTmp = await UserManager.checkAuth(); // await UserManager.isAuth();
    if (isAuthenticatedTmp) {
      setIsAuthenticated(isAuthenticatedTmp);
      if (isEntry) {
        redirectToPage({}, "checkAuth");
      }
    } else {
      UtilsManager.navigateTo("/login", {
        track: track ?? encodeURIComponent(UtilsManager.router2url(pathRouterRef.current, paramsRouterRef.current)),
      });
    }

    return isAuthenticatedTmp;
  };

  useEffect(() => {
    locationRef.current = location;
    pathRouterRef.current = pathRouter;
    paramsRouterRef.current = paramsRouter;
  }, [location, pathRouter, paramsRouter]);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // 正在检查登录状态
    return (
      <div className="m-k-page-core-wrap flex min-h-full flex-col items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500} />
      </div>
    );
  }

  return (
    <div className="m-k-page-core-wrap flex h-screen w-screen flex-col justify-start">
      <div className="flex-0">{renderPageHeader?.()}</div>
      <div className="page-core-content flex h-0 flex-1 flex-col overflow-y-auto py-4">{children}</div>
      <div className="flex-0">{renderPageFooter?.()}</div>
    </div>
  );
}
