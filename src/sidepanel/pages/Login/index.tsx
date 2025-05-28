import { Button, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ChromeManager from "@/common/kits/ChromeManager";
import imgLogo from "@/resource/oss/assets/app.webp";
import "./index.less";

export default function Login() {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  // 登录
  const handleLoginClick = () => {
    // navigate("/home");
    ChromeManager.launchWebAuthFlow();
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
