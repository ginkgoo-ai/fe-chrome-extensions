import { createHashRouter } from "react-router-dom";
import Entry from "@/options/pages/Entry";

// 全局路由
export const globalRouters = createHashRouter([
  {
    path: "/",
    element: <Entry />,
  },
]);
