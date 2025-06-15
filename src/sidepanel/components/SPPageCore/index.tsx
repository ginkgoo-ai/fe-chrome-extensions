import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import useActions from "@/common/hooks/useActions";
import { useEffectStrictMode } from "@/common/hooks/useEffectStrictMode";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import ChromeManager from "@/common/kits/ChromeManager";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import appInfoActions from "@/sidepanel/redux/actions/appInfo";
import { IRootStateType } from "@/sidepanel/types/redux";
import "./index.less";

interface SPPageCoreProps {
  renderPageHeader?: () => React.ReactNode;
  renderPageFooter?: () => React.ReactNode;
  children: React.ReactNode;
}

/**
 * 页面容器组件
 */
export default function SPPageCore(props: SPPageCoreProps) {
  const { renderPageHeader, renderPageFooter, children } = props || {};
  const { location, pathRouter, paramsRouter } = usePageParams();

  const isLoadCompleted = useRef<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { x_tabActivated } = useSelector((state: IRootStateType) => state.appInfo);

  useEventManager("ginkgo-message", (message) => {
    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;

    switch (typeMsg) {
      case "ginkgo-background-all-polit-query": {
        console.log("PageCoreSidePanel useEventManager", pilotInfoMsg);
        if (pilotInfoMsg) {
          const { caseId: caseIdMsg, workflowId: workflowIdMsg } = pilotInfoMsg || {};
          routerCompleted(
            UtilsManager.router2url("/case-detail", {
              caseId: caseIdMsg,
              workflowId: workflowIdMsg,
            })
          );
        } else {
          routerCompleted("/case-portal");
        }

        break;
      }
    }
  });

  const checkAuth = async () => {
    const isAuthenticatedTmp = await UserManager.checkAuth(); // await UserManager.isAuth();
    if (isAuthenticatedTmp) {
      setIsAuthenticated(isAuthenticatedTmp);
    } else {
      // UtilsManager.redirectTo("/entry", {
      //   track: encodeURIComponent(UtilsManager.router2url(pathRouter, paramsRouter)),
      // });
      UtilsManager.redirectTo("/login", {
        track: encodeURIComponent(UtilsManager.router2url(pathRouter, paramsRouter)),
      });
    }
  };

  const routerCompleted = (url: string) => {
    UtilsManager.redirectTo(url);
    checkAuth();
  };

  useEffect(() => {
    const { caseId: caseIdRouter, workflowId: workflowIdRouter } = paramsRouter || {};
    console.log("send polit-query", {
      type: "ginkgo-sidepanel-background-polit-query",
      caseId: caseIdRouter,
      workflowId: workflowIdRouter,
    });

    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-background-polit-query",
        caseId: caseIdRouter,
        workflowId: workflowIdRouter,
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleBtnStartClick error", error);
    }

    setTimeout(() => {
      isLoadCompleted.current = true;
    }, 500);
  }, []);

  useEffect(() => {
    if (!x_tabActivated?.id || !isLoadCompleted.current) {
      return;
    }
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-background-polit-query",
        tabId: x_tabActivated?.id,
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleBtnStartClick error", error);
    }
  }, [x_tabActivated?.id]);

  if (isAuthenticated === null) {
    // 正在检查登录状态
    return (
      <div className="m-k-page-core-wrap flex min-h-full flex-col items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500} />
      </div>
    );
  }

  return (
    <div className="m-k-page-core-wrap flex h-screen flex-col justify-start">
      <div className="flex-0">{renderPageHeader?.()}</div>
      <div className="page-core-content flex h-0 flex-1 flex-col overflow-y-auto p-4">{children}</div>
      <div className="flex-0">{renderPageFooter?.()}</div>
    </div>
  );
}
