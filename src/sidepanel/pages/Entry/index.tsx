import { useEffect } from "react";
import MKPageCore from "@/common/components/MKPageCore";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import "./index.less";

export default function Entry() {
  const init = async () => {
    const isAuth = await UserManager.checkAuth();
    if (isAuth) {
      UtilsManager.navigateBack();
    } else {
      UtilsManager.redirectTo("/login");
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <MKPageCore>
      <div></div>
    </MKPageCore>
  );
}
