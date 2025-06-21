import { Button } from "antd";
import { message } from "antd";
import { useState } from "react";
import { IconGoogle } from "@/common/components/ui/icon";
import { usePageParams } from "@/common/hooks/usePageParams";
import GlobalManager from "@/common/kits/GlobalManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import imgLogo from "@/resource/oss/assets/imgLogo.png";
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
      try {
        GlobalManager.g_backgroundPort?.postMessage({
          type: "ginkgoo-sidepanel-background-auth-check",
        });
      } catch (error) {
        console.debug("[Ginkgoo] handleLoginClick", error);
      }
      if (track) {
        UtilsManager.redirectTo(track);
      } else {
        // UtilsManager.redirectTo("/case-portal");
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
    <div className="P-login box-border flex flex-col items-center justify-center px-10">
      <img src={imgLogo} alt="logo" />
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

        <Button className="h-10 w-full max-w-[300px]" type="default" block={true} loading={isLoading} onClick={handleLoginClick}>
          <IconGoogle size={20} className="mr-1" />
          <span>Continue with Google</span>
        </Button>
      </div>
    </div>
  );
}
