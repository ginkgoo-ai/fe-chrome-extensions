/*global chrome*/
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import MKEntryPage from "@/common/components/MKEntryPage";
import MKHeader from "@/common/components/MKHeader";
import CacheManager from "@/common/kits/CacheManager";
import GlobalManager from "@/common/kits/GlobalManager";
import Api from "@/common/kits/api";
import Config from "@/common/kits/config";
import useActions from "@/common/kits/hooks/useActions";
import useSyncStorageChromeState from "@/common/kits/hooks/useSyncStorageChromeState";
import appInfoActions from "@/popup/redux/actions/appInfo";
import { IRootStateType } from "@/popup/types/redux.d";
import versionInfo from "@/resource/oss/version.json";
import "./index.less";

interface VersionInfo {
  version: string;
  [key: string]: any;
}

export default function Entry(): JSX.Element {
  const [showOutlet, setShowOutlet] = useState<boolean>(false);
  const [noticeVersion, setNoticeVersion] = useState<VersionInfo | null>(null);
  const [isJumpLastPath, setIsJumpLastPath] = useState<boolean>(false);
  const [lastPath, setLastPath] = useSyncStorageChromeState<string | null>(null, "c_entry_last_path");
  const [entryList, setEntryList] = useSyncStorageChromeState<any[]>(Config.entryListDefault, "c_entry_list");
  const [themeValueStorage, setThemeValueStorage] = useSyncStorageChromeState<string>("DEFAULT", "c_theme_value");

  const { x_themeValue, x_outletInfo } = useSelector((state: IRootStateType) => state.appInfo);

  const location = useLocation();
  const navigate = useNavigate();

  const { setThemeValue, setVersionInfo, updateOutletPosition } = useActions(appInfoActions);

  // 处理登录用户信息
  const postLoginMemberInfo = async (): Promise<void> => {
    const resLogin = await Api.Orz2.postLoginMemberInfo();
    // console.log("postLoginMemberInfo", resLogin);
    const { body } = resLogin || {};
    const { memberInfo, token } = body || {};
    if (memberInfo) {
      CacheManager.setSyncStorageChrome({
        c_member_info: memberInfo,
      });
    }
    if (token) {
      CacheManager.setSyncStorageChrome({
        c_token: token,
      });
    }
  };

  const init = async (): Promise<void> => {
    // chrome.runtime.onMessage.addListener(BackgroundEventManager.onPopupMessage);
    const versionJSON = versionInfo;
    const remoteJSON = null;
    const resVersionInfo = remoteJSON ?? versionJSON;

    if (resVersionInfo) {
      setVersionInfo(resVersionInfo);
      GlobalManager.g_versionInfo = resVersionInfo;
      if (resVersionInfo?.versionInfo?.version !== GlobalManager.g_version) {
        setNoticeVersion(resVersionInfo?.versionInfo);
      }
    }
  };

  useEffect(() => {
    init();
    if (GlobalManager.g_isDev) {
      return;
    }
    postLoginMemberInfo();
  }, []);

  useEffect(() => {
    // console.log("location.pathname", location.pathname);
    if (lastPath) {
      setLastPath(location.pathname);
    }
    if (["", "/"].includes(location.pathname)) {
      setShowOutlet(false);
    } else {
      setShowOutlet(true);
    }
  }, [location]);

  useEffect(() => {
    if (isJumpLastPath) {
      return;
    }
    // 回到上一次的页面
    if (lastPath && location.pathname !== lastPath) {
      setIsJumpLastPath(true);
      navigate(lastPath);
      updateOutletPosition({
        top: 0,
        left: 0,
      });
    }
  }, [lastPath]);

  useEffect(() => {
    if (themeValueStorage !== x_themeValue) {
      setThemeValue(themeValueStorage);
    }
  }, [themeValueStorage]);

  const handleBtnGlobalClick = async (): Promise<void> => {
    // ...
  };

  return (
    <div className="p-entry-wrap flex h-full w-full flex-col bg-slate-100">
      <MKHeader />
      <div className="entry-content">
        <Swiper
          className="entry-swiper"
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {entryList.map((item, index) => {
            return (
              <SwiperSlide key={index}>
                <MKEntryPage entryList={item.appList} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      {showOutlet && (
        <div
          className="entry-outlet"
          style={{
            top: x_outletInfo?.position?.top || 0,
            left: x_outletInfo?.position?.left || 0,
          }}
        >
          <Outlet />
        </div>
      )}
      <div className="entry-phone"></div>
    </div>
  );
}
