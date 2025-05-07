import { ClearOutlined, HistoryOutlined } from "@ant-design/icons";
import { Drawer, Modal, Steps, Tag, Tooltip, message } from "antd";
import md5 from "blueimp-md5";
import classnames from "classnames";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import MKButton from "@/common/components/MKButton";
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
import "./index.less";

const DELAY_STEP = 2000;
const DELAY_ACTION = 100;
const REPEAT_MAX = 5;

const { confirm } = Modal;

export default function Entry() {
  const refLockSteping = useRef<boolean>(false);
  const refTabActivated = useRef<chrome.tabs.Tab | null>(null);
  const refRepeatCurrent = useRef<number>(1);
  const refRepeatHash = useRef<string>("");

  const [status, setStatus] = useState<StatusEnum>(StatusEnum.STOP);
  const [stepListCurrent, setStepListCurrent] = useState<number>(-1);
  const [stepListItems, setStepListItems] = useState<IStepItemType[]>([]);
  const [htmlInfo, setHtmlInfo] = useState<string>("");
  const [isDrawerHistoryOpen, setDrawerHistoryOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<{ title: JSX.Element; description: JSX.Element }[]>([]);

  const { x_tabActivated } = useSelector((state: IRootStateType) => state.appInfo);

  const { updateTabActivated } = useActions(appInfoActions);

  const { clear: clearInterval } = useInterval(
    async () => {
      if (refLockSteping.current) {
        return;
      }

      refLockSteping.current = true;
      await main();
      refLockSteping.current = false;
    },
    {
      delay: DELAY_STEP,
      immediate: true,
      enabled: status !== StatusEnum.STOP,
    }
  );

  const init = async () => {
    const resTabInfo = await ChromeManager.queryTabInfo({});
    updateTabActivated(resTabInfo);
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    setHtmlInfo("");
  }, [x_tabActivated]);

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
    const { title, descriptionText = "Analyzing..." } = params || {};

    const indexStep = stepListCurrent + 1;

    setStepListItems((prev) => {
      return [
        ...prev,
        {
          title: title,
          description: (
            <div className="box-border pl-2">
              <span>{descriptionText}</span>
            </div>
          ),
          actioncurrent: 0,
          actionlist: [],
        },
      ];
    });
    setStepListCurrent(indexStep);
  };

  const updateStepListItemsForUpdateStep = (params: { stepcurrent?: number; actionlist: IActionItemType[] }) => {
    const { stepcurrent: stepcurrentParams, actionlist } = params || {};

    const indexStep = stepListCurrent + 1;

    const actionItems = actionlist.map((itemAction, indexAction) => {
      return calcActionItem(itemAction, indexStep, indexAction);
    });

    setStepListItems((prev) => {
      const stepcurrent = stepcurrentParams === undefined ? prev.length - 1 : stepcurrentParams;

      return prev.map((itemStep, indexStep) => {
        if (stepcurrent === indexStep) {
          return {
            title: itemStep.title,
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

      // Add History
      if (stepcurrent >= 0 && actioncurrent >= 0) {
        const actionItem = prev?.[stepcurrent]?.actionlist?.[actioncurrent];
        if (actionItem) {
          setHistoryList((prev) => {
            return [
              ...prev,
              calcActionItem(
                {
                  type: actionItem.type,
                  selector: actionItem.selector,
                  actionresult,
                  actiontimestamp,
                },
                prev.length,
                actioncurrent
              ),
            ];
          });
        }
        setTimeout(() => {
          const element = document.getElementById(`action-item-${stepcurrent}-${actioncurrent}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" }); // auto nearest‌
          }
        }, 20);
      }

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
          title: itemStep.title,
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

  const main = async () => {
    if (!refTabActivated.current) {
      message.open({ type: "error", content: MESSAGE.NOT_FOUND_TAB });
      setStatus(StatusEnum.STOP);
      return;
    }

    setStatus(StatusEnum.QUERY);
    const resQueryHtmlInfo = await ChromeManager.executeScript(refTabActivated.current, {
      cbName: "queryHtmlInfo",
      cbParams: {},
    });

    const html = resQueryHtmlInfo?.[0]?.result;

    if (!html) {
      message.open({ type: "error", content: MESSAGE.NOT_SUPPORT_PAGE });
      setStatus(StatusEnum.STOP);
      return;
    }

    const { rootHtml, mainHtml } = HTMLManager.cleansingHtml({ html });
    const htmlCleansing = mainHtml || rootHtml;

    setHtmlInfo(JSON.stringify(htmlCleansing, null, 2));

    const resQuerySelector = await ChromeManager.executeScript(refTabActivated.current, {
      cbName: "querySelector",
      cbParams: {
        selector: "h1",
        attr: [
          {
            key: "innerText",
          },
        ],
      },
    });
    const title =
      (resQuerySelector?.[0]?.result?.innerText || "Unknown Page") +
      (refRepeatCurrent.current > 1 ? `(Repeat: ${refRepeatCurrent.current})` : "");

    if (refRepeatCurrent.current < REPEAT_MAX) {
      updateStepListItemsForAddStep({
        title,
        descriptionText: "Analyzing...",
      });
    } else {
      message.open({ type: "error", content: MESSAGE.REPEAT_MAX });
      setStatus(StatusEnum.STOP);
      updateStepListItemsForAddStep({
        title,
        descriptionText: "Repeat max. Please manually operate and then try start again.",
      });
      return;
    }

    // Fetch Assistant API
    setStatus(StatusEnum.ANALYSIS);
    const resAssistent = await Api.Ginkgo.getAssistent({
      body: {
        message: htmlCleansing,
      },
    });
    // await UtilsManager.sleep(2000);
    // const resAssistent = {
    //   "result": {
    //     "actions": [
    //       {
    //         "selector": 'input[id="password"][type="password"][name="password"]',
    //         "type": "input",
    //         "value": "qqqqqqqqqqqq",
    //       },
    //       {
    //         "selector": 'input[id="submit"][type="submit"][name="submit"]',
    //         "type": "click",
    //       },
    //     ],
    //   },
    // };

    const actionlist = resAssistent?.result?.actions || [];

    const hash = md5(JSON.stringify(actionlist)); // htmlCleansing
    if (hash === refRepeatHash.current) {
      refRepeatCurrent.current++;
    } else {
      refRepeatCurrent.current = 2;
      refRepeatHash.current = hash;
    }

    updateStepListItemsForUpdateStep({
      actionlist,
    });

    // Execute Action
    setStatus(StatusEnum.ACTION);
    for (let i = 0; i < actionlist.length; i++) {
      if (i !== 0) {
        await UtilsManager.sleep(DELAY_ACTION);
      }

      const action = actionlist[i];
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
    }

    setStatus(StatusEnum.WAIT);
  };

  const handleBtnStartClick = () => {
    refTabActivated.current = x_tabActivated;
    setStatus(StatusEnum.START);
  };

  const handleBtnStopClick = () => {
    setStatus(StatusEnum.STOP);
    refTabActivated.current = null;
  };

  const handleBtnHistoryClick = () => {
    setDrawerHistoryOpen(true);
  };

  const handleBtnCleanClick = () => {
    confirm({
      title: "Are you sure you want to clean the history?",
      onOk: () => {
        setStepListCurrent(-1);
        setStepListItems([]);
        setHtmlInfo("");
        setHistoryList([]);
      },
    });
  };

  return (
    <div className="entry-wrap flex h-screen w-screen flex-col">
      {/* Header */}
      <div className="flex-0 flex h-10 flex-row items-center justify-between p-4">
        <div className="flex-0 w-5"></div>
        <div className="flex-1 whitespace-nowrap text-center font-bold">AI Form Assistant</div>
        <div className="flex-0 w-5"></div>
      </div>
      <div className="flex-0 flex flex-col gap-2 border-b border-solid border-gray-200 p-4">
        <div className="flex flex-row gap-2">
          <span className="whitespace-nowrap font-bold">Tab Id:</span>
          <span className="whitespace-pre-wrap">{x_tabActivated?.id}</span>
        </div>
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
        <div className="flex flex-col gap-2">
          <div className="whitespace-nowrap font-bold">Steps:</div>
          <Steps direction="vertical" current={stepListCurrent} items={stepListItems} />
        </div>
        {/* HTML Info */}
        <div className="flex flex-row gap-2">
          <span className="whitespace-nowrap font-bold">HTML Info:</span>
          <div className="whitespace-pre-wrap">{htmlInfo}</div>
        </div>
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
      <Drawer open={isDrawerHistoryOpen} title="History" onClose={() => setDrawerHistoryOpen(false)}>
        <div className="box-border flex w-full">
          <Steps progressDot direction="vertical" current={historyList.length - 1} items={historyList} />
        </div>
      </Drawer>
    </div>
  );
}
