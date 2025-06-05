import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import MKButton from "@/common/components/MKButton";
import CacheManager from "@/common/kits/CacheManager";
import GlobalManager from "@/common/kits/GlobalManager";
import { IRootStateType } from "@/sidepanel/types/redux.d";
import "./index.less";

interface GlobalManagerType {
  [key: string]: any;
}

interface CacheItem {
  title: string;
  value: any;
}

export default function MKModuleCache(props: {}) {
  const appInfo = useSelector((state: IRootStateType) => state.appInfo);

  const [cacheList, setCacheList] = useState<CacheItem[]>([]);

  const init = async () => {
    const res = (await CacheManager.getSyncStorageChrome()) || {};
    const cacheListTmp = Object.keys(res).map((key) => {
      let value = res[key];
      try {
        value = JSON.stringify(JSON.parse(res[key]), null, 2);
      } catch (error) {}
      return {
        title: key,
        value: value,
      };
    });
    setCacheList(cacheListTmp);
  };

  useEffect(() => {
    init();
  }, []);

  const handleBtnClearClick = () => {
    CacheManager.clearSyncStorageChrome();
    handleBtnRefreshClick();
  };

  const handleBtnRefreshClick = () => {
    init();
  };

  const handleBtnConsoleClick = async () => {
    const globalManager = GlobalManager as GlobalManagerType;
    for (let item in globalManager) {
      if (item.startsWith("g_")) {
        console.log(item, ":", globalManager[item]);
      }
    }
    for (let item in appInfo) {
      if (item.startsWith("x_")) {
        console.log(item, ":", appInfo[item]);
      }
    }
    const cacheSyncInfo = (await CacheManager.getSyncStorageChrome()) || {};
    for (let item in cacheSyncInfo) {
      // if (item.startsWith("c_")) {
      console.log(item, ":", cacheSyncInfo[item]);
      // }
    }
  };

  return (
    <div className="m-k-module-cache-wrap">
      <div className="m-k-module-cache-operation">
        <MKButton width="30%" height="1.6rem" size="1rem" onClick={handleBtnClearClick}>
          Clear
        </MKButton>
        <MKButton width="30%" height="1.6rem" size="1rem" onClick={handleBtnRefreshClick}>
          Refresh
        </MKButton>
        <MKButton width="30%" height="1.6rem" size="1rem" onClick={handleBtnConsoleClick}>
          Console
        </MKButton>
      </div>
      {cacheList.map((item, index) => {
        return (
          <div key={`module-cache-${index}`}>
            <div className="module-cache-title">{item.title}</div>
            {typeof item.value === "string" ? (
              <span className="module-cache-desc">{item.value}</span>
            ) : (
              <span className="module-cache-desc">{JSON.stringify(item.value, null, 2)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
