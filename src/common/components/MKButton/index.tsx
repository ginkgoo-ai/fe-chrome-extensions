import { Button, ButtonProps } from "antd";
import "./index.less";

interface MKButtonProps extends ButtonProps {
  customStyleWrap?: React.CSSProperties;
}

/**
 * 按钮组件
 */
export default function MKButton(props: MKButtonProps): JSX.Element {
  const { customStyleWrap = {}, children } = props || {};

  return (
    <Button {...props} style={customStyleWrap}>
      {children}
    </Button>
  );
}
