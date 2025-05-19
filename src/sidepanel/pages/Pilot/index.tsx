import { ClearOutlined, CopyOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, App, Descriptions, DescriptionsProps, Drawer, StepProps, Steps, Tag, Tooltip, message } from "antd";
import classnames from "classnames";
import { useSelector } from "react-redux";
import { v4 as uuidV4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import MKButton from "@/common/components/MKButton";
import MKModuleSupport from "@/common/components/MKModuleSupport";
import { MESSAGE } from "@/common/config/message";
import ChromeManager from "@/common/kits/ChromeManager";
import GlobalManager from "@/common/kits/GlobalManager";
import HTMLManager from "@/common/kits/HTMLManager";
import MemberManager from "@/common/kits/MemberManager";
import { useActions } from "@/common/kits/hooks/useActions";
import { useEventManager } from "@/common/kits/hooks/useEventManager";
import { IActionItemType, IStepItemType, PilotStatusEnum } from "@/common/types/pilot.t";
import appInfoActions from "@/sidepanel/redux/actions/appInfo";
import { IRootStateType } from "@/sidepanel/redux/types";
import { IProfileType, profileMock } from "./config/mock";
import "./index.less";

const TITLE_PAGE = "Ginkgoo AI Form Assistant";

export default function Pilot() {
  const { modal } = App.useApp();

  const pilotId = useRef<string>(uuidV4());

  const [pilotStatus, setPilotStatus] = useState<PilotStatusEnum>(PilotStatusEnum.HOLD);
  const [alertTip, setAlertTip] = useState<{ type: "success" | "info" | "warning" | "error"; message: string } | null>(null);
  const [stepListCurrent, setStepListCurrent] = useState<number>(-1);
  const [stepListItems, setStepListItems] = useState<StepProps[]>([]);
  const [isLoginLoading, setLoginLoading] = useState<boolean>(false);
  const [isCopyHtmlLoading, setCopyHtmlLoading] = useState<boolean>(false);
  const [isDrawerProfileOpen, setDrawerProfileOpen] = useState<boolean>(false);
  const [isDrawerProfileLoading, setDrawerProfileLoading] = useState<boolean>(true);
  const [profileName, setProfileName] = useState<string>("");
  const [profileItems, setProfileItems] = useState<DescriptionsProps["items"]>([]);

  const { x_tabActivated } = useSelector((state: IRootStateType) => state.appInfo);
  const { updateTabActivated } = useActions(appInfoActions);

  const { emit } = useEventManager("ginkgo-message", (message) => {
    // console.log('🚀 ~ useEventManager ~ data:', message);

    const { type, pilotItem } = message;

    switch (type) {
      case "ginkgo-background-all-pilot-update": {
        setPilotStatus(pilotItem.pilotStatus);
        setStepListCurrent(pilotItem.stepListCurrent);
        setStepListItems(calcStepListCurrent(pilotItem.stepListItems));
        break;
      }
    }
  });

  const calcActionItem = (item: IActionItemType, indexStep: number, indexAction: number) => {
    const { type, selector, value, actionresult, actiontimestamp } = item || {};

    return {
      title: (
        <div id={`action-item-${indexStep}-${indexAction}`} className="flex flex-row items-center gap-1">
          <Tag className="flex-0 whitespace-nowrap" color="success">
            {type}
          </Tag>
          <Tooltip placement="top" title={selector} mouseEnterDelay={1}>
            <div className="flex-1 truncate">{selector}</div>
          </Tooltip>
          {actionresult && (
            <Tag className="flex-0 whitespace-nowrap" color={actionresult === "success" ? "success" : "error"}>
              {actionresult}
            </Tag>
          )}
        </div>
      ),
      description: (
        <div className="flex w-full flex-col">
          {value && <div className="flex flex-row gap-1 text-gray-400">value: {value}</div>}
          <div className="flex flex-row gap-1 text-gray-400">{actiontimestamp}</div>
        </div>
      ),
    };
  };

  const calcStepListCurrent = (source: IStepItemType[] = []) => {
    const result = source.map((itemStep, indexStep) => {
      return {
        title: (
          <div id={`step-item-${indexStep}`} className="font-bold">
            {itemStep.title}
          </div>
        ),
        description: (
          <div className="box-border pl-2">
            <Steps
              progressDot
              direction="vertical"
              current={itemStep.actioncurrent}
              items={itemStep.actionlist.map((itemAction, indexAction) => calcActionItem(itemAction, indexStep, indexAction))}
            />
          </div>
        ),
      };
    });

    return result;
  };

  const init = async () => {
    const resTabInfo = await ChromeManager.queryTabInfo({});
    updateTabActivated(resTabInfo);
    refreshProfileInfo();
    setProfileItems(
      Object.keys(profileMock).map((key, index) => {
        const item = profileMock[key as keyof IProfileType];
        return {
          key: index,
          label: item.label,
          children: Array.isArray(item.value)
            ? item.value
                .filter((itemValue) => !itemValue.hidden)
                .map((itemValue) => {
                  return itemValue.value;
                })
                .join(", ")
            : item.value,
        };
      })
    );
  };

  useEffect(() => {
    init();
  }, []);

  const refreshProfileInfo = async () => {
    const resMemberInfo = await MemberManager.getToken(); // getMemberInfo();
    setProfileName(resMemberInfo?.toString()?.charAt(0)?.toUpperCase());
  };

  const handleBtnStartClick = () => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-all-pilot-start",
        pilotId: pilotId.current,
        caseId: "demo",
        tabInfo: x_tabActivated,
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleBtnStartClick error", error);
    }
  };

  const handleBtnStopClick = () => {
    try {
      GlobalManager.g_backgroundPort?.postMessage({
        type: "ginkgo-sidepanel-all-pilot-stop",
        pilotId: pilotId.current,
        caseId: "demo",
        tabInfo: x_tabActivated,
      });
    } catch (error) {
      console.error("[Ginkgo] Sidepanel handleBtnStopClick error", error);
    }
  };

  const handleBtnProfileClick = async () => {
    setLoginLoading(true);
    await MemberManager.checkLogin(
      async () => {
        refreshProfileInfo();
      },
      async () => {
        message.open({ type: "error", content: "Login failed" });
      }
    );
    setLoginLoading(false);
  };

  const handleBtnCopyHtmlClick = async () => {
    setCopyHtmlLoading(true);

    const resQueryHtmlInfo = await ChromeManager.executeScript(x_tabActivated, {
      cbName: "queryHtmlInfo",
      cbParams: {},
    });

    const html = resQueryHtmlInfo?.[0]?.result;

    if (!html) {
      setAlertTip({ type: "error", message: MESSAGE.NOT_SUPPORT_PAGE });
      return { result: false };
    }

    const { rootHtml, mainHtml, h1Text } = HTMLManager.cleansingHtml({ html });
    const htmlCleansing = mainHtml || rootHtml;

    const htmlCleansingString = JSON.stringify({ html: htmlCleansing }, null, 2);

    await navigator.clipboard.writeText(htmlCleansingString);

    message.open({ type: "success", content: MESSAGE.HTML_INFO_COPIED });

    setCopyHtmlLoading(false);
  };

  const handleBtnClearClick = () => {
    modal.confirm({
      title: "Are you sure you wish to clear the history?",
      onOk: () => {
        setStepListCurrent(-1);
        setStepListItems([]);
      },
    });
  };

  return (
    <div className="entry-wrap flex h-screen w-screen flex-col">
      {/* Header */}
      <div className="flex-0 flex h-10 flex-row items-center justify-between p-4">
        <div className="flex-0 w-5"></div>
        <div className="flex-1 whitespace-nowrap text-center font-bold">{TITLE_PAGE}</div>
        <div className="flex-0 w-5">
          <MKButton type="primary" shape="circle" loading={isLoginLoading} onClick={handleBtnProfileClick}>
            {isLoginLoading ? "" : profileName}
          </MKButton>
        </div>
      </div>
      {/* Status */}
      <div className="flex-0 flex flex-col gap-2 border-b border-solid border-gray-200 p-4">
        <div className="flex flex-row gap-2">
          <span className="whitespace-nowrap font-bold">Tab Url:</span>
          <span className="whitespace-pre-wrap break-words break-all">{x_tabActivated?.url}</span>
        </div>
        {/* Status */}
        <div className="flex flex-row gap-2">
          <span className="whitespace-nowrap font-bold">Status:</span>
          <span
            className={classnames("font-bold", {
              "text-green-500": pilotStatus !== PilotStatusEnum.HOLD,
              "text-red-500": pilotStatus === PilotStatusEnum.HOLD,
            })}
          >
            {pilotStatus}
          </span>
        </div>
      </div>
      {alertTip && (
        <div className="flex-0 box-border w-full p-1">
          <Alert closable showIcon={false} type={alertTip.type} message={alertTip.message} onClose={() => setAlertTip(null)} />
        </div>
      )}
      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-4 pb-[10vh] pt-4">
        {/* Steps */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="whitespace-nowrap font-bold">Steps:</div>
          <Steps direction="vertical" current={stepListCurrent} items={stepListItems} />
        </div>
      </div>
      <div className="flex-0 w-full">
        <MKModuleSupport />
      </div>
      {/* Footer */}
      <div className="flex-0 flex flex-row items-center justify-between border-t border-solid border-gray-200 px-4 py-2">
        <div className="flex flex-row gap-2">
          <MKButton type="primary" disabled={false} onClick={handleBtnStartClick}>
            Start
          </MKButton>
          <MKButton type="default" disabled={false} onClick={handleBtnStopClick}>
            Stop
          </MKButton>
        </div>
        <div className="flex flex-row gap-2">
          {/* <MKButton type="primary" shape="circle" icon={<HistoryOutlined />} onClick={handleBtnHistoryClick} /> */}
          <MKButton type="primary" icon={<CopyOutlined />} loading={isCopyHtmlLoading} onClick={handleBtnCopyHtmlClick} />
          <MKButton type="primary" icon={<ClearOutlined />} onClick={handleBtnClearClick} />
          {/* <MKButton type="primary" icon={<SettingOutlined />} onClick={handleBtnSettingClick} /> */}
        </div>
      </div>
      {/* Layout History */}
      <Drawer open={isDrawerProfileOpen} title="Profile Info" loading={isDrawerProfileLoading} onClose={() => setDrawerProfileOpen(false)}>
        <Descriptions items={profileItems} column={1} />
      </Drawer>
    </div>
  );
}
