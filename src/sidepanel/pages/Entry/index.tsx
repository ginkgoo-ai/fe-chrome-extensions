import { useEffect } from "react";
import { usePageParams } from "@/common/hooks/usePageParams";
import UserManager from "@/common/kits/UserManager";
import UtilsManager from "@/common/kits/UtilsManager";
import "./index.less";

export default function Entry() {
  const { location, pathRouter, paramsRouter } = usePageParams();
  const { track = "" } = paramsRouter || {};

  // const init = async () => {
  //   const isAuth = await UserManager.checkAuth();
  //   if (isAuth) {
  //     if (track) {
  //       UtilsManager.redirectTo(track);
  //     } else {
  //       UtilsManager.navigateBack();
  //     }
  //   } else {
  //     UtilsManager.redirectTo("/login", {
  //       track,
  //     });
  //   }
  // };

  useEffect(() => {
    // init();
  }, []);

  return <div>Entry</div>;
}
