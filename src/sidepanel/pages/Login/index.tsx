import { Button, Input } from "antd";
import { message } from "antd";
import { useState } from "react";
import { usePageParams } from "@/common/hooks/usePageParams";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import imgLogo from "@/resource/oss/assets/app.webp";
import "./index.less";

export default function Login() {
  const { location, pathRouter, paramsRouter } = usePageParams();
  const { track = "" } = paramsRouter || {};

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setLoading] = useState<boolean>(false);

  // 登录
  const handleLoginClick = async () => {
    setLoading(true);
    const resLogin = await UserManager.login();
    setLoading(false);

    if (resLogin) {
      if (track) {
        UtilsManager.redirectTo(track);
      } else {
        UtilsManager.navigateBack();
      }
      return;
    }

    message.open({
      content: `There seems to be a little problem.`,
      type: "error",
    });
  };

  return (
    <div className="P-login">
      <img src={imgLogo} alt="" className="logo" />
      <div className="ipt-con">
        <Input
          placeholder="账号"
          value={account}
          onChange={(e) => {
            setAccount(e.target.value);
          }}
        />
      </div>
      <div className="ipt-con">
        <Input.Password
          placeholder="密码"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <div className="ipt-con">
        <Button type="primary" block={true} loading={isLoading} onClick={handleLoginClick}>
          登录
        </Button>
      </div>
    </div>
  );
}
