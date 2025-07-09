import { Button } from "antd";
import { message } from "antd";
import { useState } from "react";
import { MESSAGE } from "@/common/config/message";
import { usePageParams } from "@/common/hooks/usePageParams";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import imgApp from "@/resource/oss/assets/app.png";
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
      GlobalManager.postMessage({
        type: "ginkgoo-sidepanel-background-auth-check",
      });

      // if (track) {
      //   UtilsManager.redirectTo(track);
      // } else {
      //   UtilsManager.redirectTo("/case-portal");
      //   // UtilsManager.navigateBack();
      // }
      UtilsManager.navigateBack();
      return;
    }

    message.open({
      type: "error",
      content: MESSAGE.TOAST_PROBLEM,
    });
  };

  return (
    <div className="P-login box-border flex flex-col items-center justify-center px-10">
      <div className="flex flex-row items-center gap-2">
        <img src={imgApp} className="h-10 w-10" alt="logo" />
        <div className="text-3xl">Ginkgoo</div>
        <div className="text-3xl text-[#B3B3B3]">Legal</div>
      </div>
      <div className="mt-[320px] box-border flex w-full flex-col items-center justify-center px-10">
        {/* <div className="ipt-con">
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
        </div> */}

        <Button className="h-10 w-full max-w-[300px]" type="primary" block={true} loading={isLoading} onClick={handleLoginClick}>
          {/* <IconGoogle size={20} className="mr-1" /> */}
          <span>Sign in</span>
        </Button>
      </div>
    </div>
  );
}
