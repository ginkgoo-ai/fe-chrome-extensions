import { createHashRouter } from "react-router-dom";
import About from "@/sidepanel/pages/About";
import Debug from "@/sidepanel/pages/Debug";
import Entry from "@/sidepanel/pages/Entry";
import Login from "@/sidepanel/pages/Login";
import Privacy from "@/sidepanel/pages/Privacy";

// 全局路由
export const globalRouters = createHashRouter([
  {
    // 对精确匹配"/login"，跳转Login页面
    path: "/login",
    element: <Login />,
  },
  {
    // 未匹配"/login"，全部进入到entry路由
    path: "/",
    element: <Entry />,
    // 定义entry二级路由
    children: [
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/debug",
        element: <Debug />,
      },
      {
        path: "/privacy",
        element: <Privacy />,
      },
      {
        path: "*",
        element: <Entry />,
      },
      // {
      //   // 如果URL没有"#路由"，跳转Home页面
      //   path: "/",
      //   element: <Navigate to="/home" />
      // },
      // {
      //   // 未匹配，跳转Login页面
      //   path: "*",
      //   element: <Navigate to="/home" />
      // }
    ],
  },
]);
