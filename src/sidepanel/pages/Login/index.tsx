import { Button, Input } from "antd";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ChromeManager from "@/common/kits/ChromeManager";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import imgLogo from "@/resource/oss/assets/app.webp";
import "./index.less";

export default function Login() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  // 登录
  const handleLoginClick = async () => {
    // navigate("/home");
    const { redirectUri, code, codeVerifier, oauthState } = await ChromeManager.launchWebAuthFlow();
    if (code) {
      const res = await UserManager.queryTokenByCode({
        redirect_uri: redirectUri,
        code,
        code_verifier: codeVerifier,
      });
      if (res) {
        UtilsManager.navigateBack();
      }
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
        <Button type="primary" block={true} onClick={handleLoginClick}>
          登录
        </Button>
      </div>
    </div>
  );
}
