import { useEffect } from "react";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import "./index.less";

export default function Entry() {
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

  return (
    <SPPageCore track="/case-portal">
      <div></div>
    </SPPageCore>
  );
}
