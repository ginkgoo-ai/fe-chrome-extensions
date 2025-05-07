import { useNavigate } from "react-router-dom";
import GlobalManager from "@/common/kits/GlobalManager";
import imgBgTip from "@/resource/oss/assets/bgTip.png";
import MKButton from "../MKButton";
import "./index.less";

interface MKHeaderProps {
  title?: string;
  children?: React.ReactNode;
}

/**
 * 页面头部组件
 */
export default function MKHeader(props: MKHeaderProps): JSX.Element {
  const { title = "", children } = props || {};

  const navigate = useNavigate();

  return (
    <div className="m-k-header-wrap">
      <div className="flex-0 flex h-6 flex-row items-center justify-between">
        <div className="ml-3 flex-1 text-center text-xs font-bold">{GlobalManager.g_webenv.toUpperCase()}</div>
        <div className="flex-0 w-[150px]"></div>
        <img className="mr-2 w-[48px] flex-1" src={imgBgTip} alt="Background Tip" />
      </div>
      {(children || title) && (
        <div className="flex-0 flex h-6 flex-row items-center justify-between">
          <div className="flex-0 w-5">
            <MKButton
              type="text"
              src="icon-left"
              width="1rem"
              height="1rem"
              size="1rem"
              customStyleIcon={{
                fontWeight: "bold",
              }}
              onClick={() => {
                window.history.back();
              }}
            />
          </div>
          <div className="w-0 flex-1 truncate text-center text-sm font-bold">{children || title}</div>
          <div className="flex-0 w-5"></div>
        </div>
      )}
    </div>
  );
}
