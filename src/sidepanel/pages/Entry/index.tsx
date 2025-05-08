import { ClearOutlined } from "@ant-design/icons";
import { App, Descriptions, DescriptionsProps, Drawer, Steps, Tag, Tooltip, message } from "antd";
import md5 from "blueimp-md5";
import classnames from "classnames";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import MKButton from "@/common/components/MKButton";
import MKModuleLoading from "@/common/components/MKModuleLoading";
import MKModuleSupport from "@/common/components/MKModuleSupport";
import { MESSAGE } from "@/common/config/message";
import ChromeManager from "@/common/kits/ChromeManager";
import HTMLManager from "@/common/kits/HTMLManager";
import UtilsManager from "@/common/kits/UtilsManager";
import Api from "@/common/kits/api";
import { useActions } from "@/common/kits/hooks/useActions";
import { useInterval } from "@/common/kits/hooks/useInterval";
import appInfoActions from "@/sidepanel/redux/actions/appInfo";
import { IRootStateType } from "@/sidepanel/redux/types";
import { ActionResultType, IActionItemType, IStepItemType, StatusEnum } from "./config";
import { IProfileType, actionListMock, profileMock } from "./config/mock";
import "./index.less";

const TITLE_PAGE = "Ginkgoo AI Form Assistant";
const DELAY_MOCK_ANALYSIS = 2000;
const DELAY_STEP = 2000;
const DELAY_ACTION = 200;
const REPEAT_MAX = 5;

export default function Entry() {
  const refLockSteping = useRef<boolean>(false);
  const refTabActivated = useRef<chrome.tabs.Tab | null>(null);
  const refRepeatCurrent = useRef<number>(1);
  const refRepeatHash = useRef<string>("");

  const [status, setStatus] = useState<StatusEnum>(StatusEnum.STOP);
  const [stepListCurrent, setStepListCurrent] = useState<number>(-1);
  const [stepListItems, setStepListItems] = useState<IStepItemType[]>([]);
  const [htmlInfo, setHtmlInfo] = useState<string>("");
  const [isDrawerProfileOpen, setDrawerProfileOpen] = useState<boolean>(false);
  const [isDrawerProfileLoading, setDrawerProfileLoading] = useState<boolean>(true);
  const [profileName, setProfileName] = useState<string>("");
  const [profileItems, setProfileItems] = useState<DescriptionsProps["items"]>([]);

  const { x_tabActivated } = useSelector((state: IRootStateType) => state.appInfo);

  const { updateTabActivated } = useActions(appInfoActions);

  const { modal } = App.useApp();

  const { clear: clearInterval } = useInterval(
    async () => {
      if (refLockSteping.current) {
        return;
      }

      refLockSteping.current = true;
      const resMain = await main();
      if (!resMain?.result) {
        setStatus(StatusEnum.STOP);
      }
      await UtilsManager.sleep(DELAY_STEP);
      refLockSteping.current = false;
    },
    {
      delay: 20,
      immediate: true,
      enabled: status !== StatusEnum.STOP,
    }
  );

  const init = async () => {
    const resTabInfo = await ChromeManager.queryTabInfo({});
    updateTabActivated(resTabInfo);
    setProfileName(profileMock.firstname.value.toString().charAt(0).toUpperCase());
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
    window.document.title = TITLE_PAGE;
    init();
  }, []);

  useEffect(() => {
    if (status === StatusEnum.STOP) {
      refLockSteping.current = false;
      refTabActivated.current = null;
      refRepeatCurrent.current = 1;
      refRepeatHash.current = "";
      clearInterval();
    }
  }, [status]);

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

  const updateStepListItemsForAddStep = (params: { title: string; descriptionText: string }) => {
    const { title, descriptionText = "Analyzing" } = params || {};

    setStepListItems((prev) => {
      const prevLength = prev.length;

      setTimeout(() => {
        document.getElementById(`step-item-${prevLength}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 40);

      setStepListCurrent(prevLength);

      return [
        ...prev,
        {
          title: (
            <div id={`step-item-${prevLength}`} className="font-bold">
              {title}
            </div>
          ),
          description: (
            <div className="box-border pl-2">
              {["Analyzing"].includes(descriptionText) ? <MKModuleLoading label={descriptionText} /> : <span>{descriptionText}</span>}
            </div>
          ),
          actioncurrent: 0,
          actionlist: [],
        },
      ];
    });
  };

  const updateStepListItemsForUpdateStep = (params: { stepcurrent?: number; actionlist: IActionItemType[] }) => {
    const { stepcurrent: stepcurrentParams, actionlist } = params || {};

    const indexStep = stepListCurrent + 1;

    const actionItems = actionlist.map((itemAction, indexAction) => {
      return calcActionItem(itemAction, indexStep, indexAction);
    });

    setStepListItems((prev) => {
      const stepcurrent = stepcurrentParams === undefined ? prev.length - 1 : stepcurrentParams;

      setTimeout(() => {
        document.getElementById(`step-item-${stepcurrent}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 40);

      return prev.map((itemStep, indexStep) => {
        if (stepcurrent === indexStep) {
          return {
            title: (
              <div id={`step-item-${indexStep}`} className="font-bold">
                {itemStep.title}
              </div>
            ),
            description: (
              <div className="box-border pl-2">
                <Steps progressDot direction="vertical" current={0} items={actionItems} />
              </div>
            ),
            actioncurrent: 0,
            actionlist: actionlist,
          };
        }
        return itemStep;
      });
    });
    setStepListCurrent(indexStep);
  };

  const updateStepListItemsForUpdateAction = (params: {
    stepcurrent?: number;
    actioncurrent?: number;
    actionresult?: ActionResultType;
    actiontimestamp?: string;
  }) => {
    const {
      stepcurrent: stepcurrentParams,
      actioncurrent = 0,
      actionresult = "",
      actiontimestamp = dayjs().format("YYYY-MM-DD HH:mm:ss"),
    } = params || {};

    setStepListItems((prev) => {
      const stepcurrent = stepcurrentParams === undefined ? prev.length - 1 : stepcurrentParams;

      setTimeout(() => {
        document.getElementById(`action-item-${stepcurrent}-${actioncurrent}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 40);

      return prev.map((itemStep, indexStep) => {
        let actioncurrentReal = itemStep.actioncurrent;
        let actionlistReal = itemStep.actionlist;

        if (stepcurrent === indexStep) {
          actioncurrentReal = actioncurrent;
        }

        actionlistReal = actionlistReal.map((itemAction, indexAction) => {
          const isUpdateAction = stepcurrent === indexStep && actioncurrent === indexAction;

          return {
            ...itemAction,
            actionresult: isUpdateAction ? actionresult : itemAction.actionresult,
            actiontimestamp: isUpdateAction ? actiontimestamp : itemAction.actiontimestamp,
          };
        });

        const actionItems = actionlistReal.map((itemAction, indexAction) => {
          return calcActionItem(itemAction, indexStep, indexAction);
        });

        return {
          title: (
            <div id={`step-item-${indexStep}`} className="font-bold">
              {itemStep.title}
            </div>
          ),
          description: (
            <div className="box-border pl-2">
              <Steps progressDot direction="vertical" current={actioncurrentReal} items={actionItems} />
            </div>
          ),
          actioncurrent: actioncurrentReal,
          actionlist: actionlistReal,
        };
      });
    });
  };

  const queryHtmlInfo = async () => {
    if (!refTabActivated.current) {
      return { result: false };
    }

    setStatus(StatusEnum.QUERY);
    const resQueryHtmlInfo = await ChromeManager.executeScript(refTabActivated.current, {
      cbName: "queryHtmlInfo",
      cbParams: {},
    });

    const html = resQueryHtmlInfo?.[0]?.result;

    if (!html) {
      message.open({ type: "error", content: MESSAGE.NOT_SUPPORT_PAGE });
      return { result: false };
    }

    const { rootHtml, mainHtml, h1Text } = HTMLManager.cleansingHtml({ html });
    const htmlCleansing = mainHtml || rootHtml;

    setHtmlInfo(JSON.stringify(htmlCleansing, null, 2));

    const title = h1Text || "Unknown Page";

    const hash = md5(title + htmlCleansing);

    if (hash === refRepeatHash.current) {
      refRepeatCurrent.current++;
    } else {
      refRepeatCurrent.current = 1;
      refRepeatHash.current = hash;
    }

    if (refRepeatCurrent.current > REPEAT_MAX) {
      message.open({ type: "error", content: MESSAGE.REPEAT_MAX });
      updateStepListItemsForAddStep({
        title: title + `(Repeat: max)`,
        descriptionText: "Repeat max. Please manually operate and then try start again.",
      });
      return { result: false };
    }

    updateStepListItemsForAddStep({
      title: title + (refRepeatCurrent.current > 1 ? `(Repeat: ${refRepeatCurrent.current})` : ""),
      descriptionText: "Analyzing",
    });

    return { result: true, title, htmlCleansing };
  };

  const queryActionList = async (params: { title?: string; htmlCleansing?: string }) => {
    const isMock = true;
    const { title = "", htmlCleansing = "" } = params || {};
    let actionlist: IActionItemType[] = [];

    if (!refTabActivated.current) {
      return { result: false };
    }

    setStatus(StatusEnum.ANALYSIS);

    if (isMock) {
      await UtilsManager.sleep(Math.floor(Math.random() * DELAY_MOCK_ANALYSIS + 1000));
      actionlist = actionListMock[title]?.actions || [];
      if (actionlist.length === 0) {
        message.open({
          type: "success",
          content: "Feature coming Soon",
        });
        updateStepListItemsForAddStep({
          title: "Feature coming soon",
          descriptionText: "We're crafting something extraordinary for you. Stay tuned for this remarkable enhancement.🎉",
        });
        return { result: false };
      }
    } else {
      const resAssistent = await Api.Ginkgo.getAssistent({
        body: {
          message: htmlCleansing,
        },
      });

      actionlist = resAssistent?.result?.actions || [];
    }

    updateStepListItemsForUpdateStep({
      actionlist,
    });

    return { result: true, actionlist };
  };

  const executeActionList = async (params: { title?: string; actionlist?: IActionItemType[] }) => {
    const { title = "", actionlist = [] } = params || {};

    setStatus(StatusEnum.ACTION);
    for (let i = 0; i < actionlist.length; i++) {
      const action = actionlist[i];

      if (i !== 0) {
        await UtilsManager.sleep(DELAY_ACTION);
      }
      if (!refTabActivated.current) {
        return { result: false };
      }

      const resActionDom = await ChromeManager.executeScript(refTabActivated.current, {
        cbName: "actionDom",
        cbParams: {
          action,
        },
      });

      const { type } = resActionDom?.[0]?.result || {};

      updateStepListItemsForUpdateAction({
        actioncurrent: i,
        actionresult: type,
        actiontimestamp: dayjs().format("YYYY-MM-DD HH:mm:ss:SSS"),
      });

      if (action.type === "manual") {
        message.open({ type: "warning", content: "Please complete manually and try to continue" });
        return { result: false };
      }
    }

    return { result: true };
  };

  const main = async () => {
    if (!refTabActivated.current) {
      message.open({ type: "error", content: MESSAGE.NOT_FOUND_TAB });
      return { result: false };
    }

    const resQueryHtmlInfo = await queryHtmlInfo();
    if (!resQueryHtmlInfo.result) {
      return { result: false };
    }

    const resQueryActionList = await queryActionList({ title: resQueryHtmlInfo.title, htmlCleansing: resQueryHtmlInfo.htmlCleansing });
    if (!resQueryActionList.result) {
      return { result: false };
    }

    const resExecuteActionList = await executeActionList({
      title: resQueryHtmlInfo.title,
      actionlist: resQueryActionList.actionlist,
    });
    if (!resExecuteActionList.result) {
      return { result: false };
    }

    setStatus(StatusEnum.WAIT);
    return { result: true };
  };

  const handleBtnStartClick = () => {
    refTabActivated.current = x_tabActivated;
    setStatus(StatusEnum.START);
  };

  const handleBtnStopClick = () => {
    setStatus(StatusEnum.STOP);
    refTabActivated.current = null;
  };

  const handleBtnProfileClick = () => {
    setDrawerProfileOpen(true);

    setTimeout(() => {
      setDrawerProfileLoading(false);
    }, 1200);
  };

  const handleBtnCleanClick = () => {
    modal.confirm({
      title: "Are you sure you want to clean the history?",
      onOk: () => {
        setStepListCurrent(-1);
        setStepListItems([]);
        setHtmlInfo("");
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
          <MKButton type="primary" shape="circle" onClick={handleBtnProfileClick}>
            {profileName}
          </MKButton>
        </div>
      </div>
      <div className="flex-0 flex flex-col gap-2 border-b border-solid border-gray-200 p-4">
        {/* <div className="flex flex-row gap-2">
          <span className="whitespace-nowrap font-bold">Tab Id:</span>
          <span className="whitespace-pre-wrap">{x_tabActivated?.id}</span>
        </div> */}
        <div className="flex flex-row gap-2">
          <span className="whitespace-nowrap font-bold">Tab Url:</span>
          <span className="whitespace-pre-wrap break-words break-all">{x_tabActivated?.url}</span>
        </div>
        {/* Status */}
        <div className="flex flex-row gap-2">
          <span className="whitespace-nowrap font-bold">Status:</span>
          <span
            className={classnames("font-bold", {
              "text-green-500": status !== StatusEnum.STOP,
              "text-red-500": status === StatusEnum.STOP,
            })}
          >
            {status}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-4">
        {/* Steps */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="whitespace-nowrap font-bold">Steps:</div>
          <Steps direction="vertical" current={stepListCurrent} items={stepListItems} />
        </div>
        {/* HTML Info */}
        {false && (
          <div className="flex flex-row gap-2">
            <span className="whitespace-nowrap font-bold">HTML Info:</span>
            <div className="whitespace-pre-wrap">{htmlInfo}</div>
          </div>
        )}
        <MKModuleSupport />
      </div>
      {/* Footer */}
      <div className="flex-0 flex flex-row items-center justify-between border-t border-solid border-gray-200 px-4 py-2">
        <div className="flex flex-row gap-2">
          <MKButton type="primary" disabled={status !== StatusEnum.STOP} onClick={handleBtnStartClick}>
            Start
          </MKButton>
          <MKButton type="default" disabled={status === StatusEnum.STOP} onClick={handleBtnStopClick}>
            Stop
          </MKButton>
        </div>
        <div className="flex flex-row gap-2">
          {/* <MKButton type="primary" shape="circle" icon={<HistoryOutlined />} onClick={handleBtnHistoryClick} /> */}
          <MKButton type="primary" icon={<ClearOutlined />} onClick={handleBtnCleanClick} />
        </div>
      </div>
      {false && (
        <div className="flex-0 flex flex-row items-center justify-between border-t border-solid border-gray-200 px-4 py-2">
          {/* <MKButton onClick={handleBtnMockStepClick}>Mock Step</MKButton> */}
        </div>
      )}
      {/* Layout History */}
      <Drawer open={isDrawerProfileOpen} title="Profile Info" loading={isDrawerProfileLoading} onClose={() => setDrawerProfileOpen(false)}>
        <Descriptions items={profileItems} column={1} />
      </Drawer>
    </div>
  );
}
