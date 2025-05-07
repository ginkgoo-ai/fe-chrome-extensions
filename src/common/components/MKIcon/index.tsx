import classnames from "classnames";
import { useEffect, useState } from "react";
import UtilsManager from "@/common/kits/UtilsManager";
import "./index.less";

interface MKIconProps {
  size?: string;
  src?: string;
  color?: string;
  customStyle?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

type IconType = "iconfont" | "image" | "text";

/**
 * 图标组件
 */
export default function MKIcon(props: MKIconProps): JSX.Element {
  const { size = "1.5rem", src = "", color = "", customStyle = {}, onClick } = props || {};

  const [type, setType] = useState<IconType>("text");

  useEffect(() => {
    let typeTmp: IconType = "text";
    if (UtilsManager.startsWith(src, "icon")) {
      typeTmp = "iconfont";
    } else if (src.includes("/")) {
      typeTmp = "image";
    } else {
      typeTmp = "text";
    }

    setType(typeTmp);
  }, [size, src]);

  const handleIconWrapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick && onClick(e);
  };

  const renderIcon = () => {
    return {
      iconfont: (
        <div
          className={classnames({
            iconfont: true,
            "leading-none": true,
            [src]: true,
          })}
          style={{
            fontSize: size,
            color: color,
          }}
        />
      ),
      image: (
        <img
          className="saIconImage"
          style={{
            width: size,
            height: size,
          }}
          src={src}
          alt="Icon"
        />
      ),
      text: (
        <div
          className="saIconText"
          style={{
            fontSize: size,
            color: color,
          }}
        >
          {src}
        </div>
      ),
    }[type];
  };

  return (
    <div className="flex items-center justify-center" style={customStyle} onClick={handleIconWrapClick}>
      {renderIcon()}
    </div>
  );
}
