import { LoadingOutlined } from "@ant-design/icons";
import { message as messageAntd } from "antd";
import { Spin } from "antd";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import { PilotStatusEnum } from "@/common/types/casePilot";
import { IRootStateType } from "@/sidepanel/types/redux";
import "./index.less";

interface SPPageCoreProps {
  track?: string;
  renderPageHeader?: () => React.ReactNode;
  renderPageFooter?: () => React.ReactNode;
  onAuthCompleted?: () => void;
  children: React.ReactNode;
}

/**
 * 页面容器组件
 */
export default function SPPageCore(props: SPPageCoreProps) {
  const { track, renderPageHeader, renderPageFooter, onAuthCompleted, children } = props || {};
  const { location, pathRouter, paramsRouter } = usePageParams();

  const isLoadCompleted = useRef<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { x_tabActivated } = useSelector((state: IRootStateType) => state.appInfo);

  useEventManager("ginkgoo-message", async (message) => {
    const { type: typeMsg, pilotInfo: pilotInfoMsg } = message;

    switch (typeMsg) {
      case "ginkgoo-background-sidepanel-page-reload": {
        window.location.reload();
        break;
      }
      case "ginkgoo-background-all-case-done":
      case "ginkgoo-background-all-case-update": {
        const { caseId: caseIdMsg, workflowId: workflowIdMsg } = pilotInfoMsg || {};
        const { caseId: caseIdRouter, workflowId: workflowIdRouter } = paramsRouter || {};
        const isAuthSimple = await UserManager.checkAuth();

        console.log("ginkgoo-background-all-case-xxx", isAuthSimple, location.pathname);
        if (isAuthSimple && (location.pathname !== "/case-detail" || caseIdMsg !== caseIdRouter || workflowIdMsg !== workflowIdRouter)) {
          setTimeout(() => {
            UtilsManager.redirectTo("/case-detail", {
              caseId: caseIdMsg,
              workflowId: workflowIdMsg,
            });
          }, 500);
          return;
        }

        break;
      }
      // case "ginkgoo-background-all-polit-query": {
      //   // console.log("PageCoreSidePanel useEventManager", pilotInfoMsg);
      //   if (pilotInfoMsg?.timer) {
      //     const { caseId: caseIdMsg, workflowId: workflowIdMsg } = pilotInfoMsg || {};
      //     routerCompleted(
      //       UtilsManager.router2url("/case-detail", {
      //         caseId: caseIdMsg,
      //         workflowId: workflowIdMsg,
      //       })
      //     );
      //   } else {
      //     routerCompleted("/case-portal");
      //   }

      //   break;
      // }
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

  const checkAuth = async () => {
    const isAuthenticatedTmp = await UserManager.checkAuth(); // await UserManager.isAuth();
    if (isAuthenticatedTmp) {
      setIsAuthenticated(isAuthenticatedTmp);
      if (track) {
        UtilsManager.redirectTo(track);
      }
    } else {
      // UtilsManager.redirectTo("/entry", {
      //   track: encodeURIComponent(UtilsManager.router2url(pathRouter, paramsRouter)),
      // });
      UtilsManager.redirectTo("/login", {
        track: track || encodeURIComponent(UtilsManager.router2url(pathRouter, paramsRouter)),
      });
    }
  };

  const routerCompleted = (url: string) => {
    UtilsManager.redirectTo(url);
    checkAuth();
  };

  useEffect(() => {
    checkAuth();
    // const { caseId: caseIdRouter, workflowId: workflowIdRouter } = paramsRouter || {};
    // try {
    //   GlobalManager.g_backgroundPort?.postMessage({
    //     type: "ginkgoo-sidepanel-background-polit-query",
    //     caseId: caseIdRouter,
    //     workflowId: workflowIdRouter,
    //   });
    // } catch (error) {
    //   console.log("[Ginkgoo] Sidepanel handleBtnStartClick error", error);
    // }
    // setTimeout(() => {
    //   isLoadCompleted.current = true;
    // }, 500);
  }, []);

  // Check Activated Page
  // useEffect(() => {
  //   if (!x_tabActivated?.id || !isLoadCompleted.current) {
  //     return;
  //   }
  //   try {
  //     GlobalManager.g_backgroundPort?.postMessage({
  //       type: "ginkgoo-sidepanel-background-polit-query",
  //       tabId: x_tabActivated?.id,
  //     });
  //   } catch (error) {
  //     console.log("[Ginkgoo] Sidepanel handleBtnStartClick error", error);
  //   }
  // }, [x_tabActivated?.id]);

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
      <div className="page-core-content flex h-0 flex-1 flex-col overflow-y-auto p-4">{children}</div>
      <div className="flex-0">{renderPageFooter?.()}</div>
    </div>
  );
}
