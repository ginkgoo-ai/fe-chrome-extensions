import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import MKButton from "@/common/components/MKButton";
import useActions from "@/common/hooks/useActions";
import Config from "@/common/kits/config";
import appInfoActions from "@/popup/redux/actions/appInfo";
import { IRootStateType } from "@/sidepanel/types/redux";
import "./index.less";

// width: 260px = 300px - 20px * 2;
// height: 600px;
// unit: 192px = 4 * 40px; 2.5rem;
// block: 256px = 4 * 64px; 4rem;
// gap: 3px = 3 * 1px; 0.0625rem;
// margin_x: 1px = 2 * 0.5px; .0313rem;
// margin_y: 20px + 1.25rem

const ICON = 2.5;
const BLOCK = 4;
const GAP = 0.0625;
const MARGIN_X = 0.0313;
const MARGIN_Y = 0.75;

export default function MKEntryPage(props: { entryList: any }) {
  const { entryList = [] } = props || {};

  const appInfo = useSelector((state: IRootStateType) => state.appInfo);
  const { x_themeValue } = appInfo || {};

  const navigate = useNavigate();
  const { updateOutletPosition } = useActions(appInfoActions);

  const calcAppSurface = (item: any) => {
    const getXREM = (unit: number) => {
      return unit * (BLOCK + GAP) + MARGIN_X;
    };
    const getYREM = (unit: number) => {
      return unit * (BLOCK + 0.5 + GAP) + MARGIN_Y;
    };
    const { x, y, code, src, bgColorLight, bgColor, ...other } = item?.surface || {};
    const yREM = getYREM(y);
    const xREM = getXREM(x);
    const customStyleWrap: React.CSSProperties = {
      width: `${ICON}rem`,
      height: `${ICON}rem`,
    };
    if (bgColorLight && bgColor) {
      customStyleWrap.backgroundImage = `linear-gradient(135deg, ${bgColorLight} 0%, ${bgColor} 100%)`;
    } else if (bgColorLight || bgColor) {
      customStyleWrap.backgroundColor = bgColorLight || bgColor;
    }

    const srcImg = Config?.themeInfoDefault?.[x_themeValue]?.imageInfo?.[code];

    const result = {
      ...other,
      top: `${yREM}rem`,
      left: `${xREM}rem`,
      topStart: `${yREM + BLOCK}rem`,
      leftStart: `${xREM + BLOCK}rem`,
      src: srcImg || src,
      size: srcImg ? "2.5rem" : "1.5rem",
      customStyleWrap,
    };

    // console.log("calcAppSurface", result);
    return result;
  };

  const handleAppClick = (item: any, objSurface: any) => {
    const { info } = item || {};
    const { topStart, leftStart } = objSurface || {};
    const { url } = info || {};
    // console.log("handleAppClick", objSurface, info);
    navigate(url);
    updateOutletPosition({
      top: topStart,
      left: leftStart,
    });
  };

  return (
    <div className="relative h-full w-full">
      {entryList?.map((item: any, index: number) => {
        const objSurface = calcAppSurface(item);
        return (
          <div
            className={`absolute flex h-[4rem] w-[4rem] flex-col items-center justify-between`}
            key={`entry-page-app-${index}`}
            style={{
              top: objSurface.top,
              left: objSurface.left,
            }}
          >
            <MKButton
              src={objSurface.src}
              customStyleWrap={objSurface.customStyleWrap}
              size={objSurface.size}
              onClick={() => handleAppClick(item, objSurface)}
            >
              {/* {objSurface.logo} */}
            </MKButton>
            <div className="entry-page-app-name w-full select-none whitespace-nowrap text-center text-xs text-slate-700">
              {objSurface.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
