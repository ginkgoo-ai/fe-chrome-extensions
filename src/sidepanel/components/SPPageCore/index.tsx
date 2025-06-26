import { LoadingOutlined } from "@ant-design/icons";
import { message as messageAntd } from "antd";
import { Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { useEventManager } from "@/common/hooks/useEventManager";
import { usePageParams } from "@/common/hooks/usePageParams";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import "./index.less";

interface SPPageCoreProps {
  track?: string;
  renderPageHeader?: () => React.ReactNode;
  renderPageFooter?: () => React.ReactNode;
  children: React.ReactNode;
}

/**
 * 页面容器组件
 */
export default function SPPageCore(props: SPPageCoreProps) {
  const { track, renderPageHeader, renderPageFooter, children } = props || {};
  const { location, pathRouter, paramsRouter } = usePageParams();

  const locationRef = useRef(location);
  const pathRouterRef = useRef(pathRouter);
  const paramsRouterRef = useRef(paramsRouter);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEventManager("ginkgoo-message", async (message) => {
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
      case "ginkgoo-background-all-pilot-done":
      case "ginkgoo-background-all-pilot-update": {
        const { pilotInfo: pilotInfoMsg } = message;
        const { pilotCaseInfo: pilotCaseInfoMsg, pilotWorkflowInfo: pilotWorkflowInfoMsg } = pilotInfoMsg || {};
        const { id: caseIdMsg } = pilotCaseInfoMsg || {};
        const { workflow_instance_id: workflowIdMsg } = pilotWorkflowInfoMsg || {};

        const { caseId: caseIdRouter, workflowId: workflowIdRouter } = paramsRouterRef.current || {};
        const isAuthSimple = await UserManager.checkAuth();

        if (!isAuthSimple) {
          UtilsManager.redirectTo("/login", {
            track: encodeURIComponent(UtilsManager.router2url(pathRouterRef.current, paramsRouterRef.current)),
          });
          return;
        }

        if (!workflowIdMsg && locationRef.current.pathname !== "/case-portal") {
          setTimeout(() => {
            UtilsManager.redirectTo("/case-portal");
          }, 500);
          return;
        }

        if (
          workflowIdMsg &&
          (locationRef.current.pathname !== "/case-detail" || caseIdRouter !== caseIdMsg || workflowIdRouter !== workflowIdMsg)
        ) {
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
      UtilsManager.redirectTo("/login", {
        track: track || encodeURIComponent(UtilsManager.router2url(pathRouterRef.current, paramsRouterRef.current)),
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
      <div className="page-core-content flex h-0 flex-1 flex-col overflow-y-auto p-4">{children}</div>
      <div className="flex-0">{renderPageFooter?.()}</div>
    </div>
  );
}
