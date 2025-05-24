import { Navigate, createHashRouter } from "react-router-dom";
import About from "@/sidepanel/pages/About";
import Pilot from "@/sidepanel/pages/Case";
import Debug from "@/sidepanel/pages/Debug";
import Login from "@/sidepanel/pages/Login";
import Privacy from "@/sidepanel/pages/Privacy";

// 全局路由
export const globalRouters = createHashRouter([
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/debug",
    element: <Debug />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/pilot",
    element: <Pilot />,
  },
  {
    path: "/privacy",
    element: <Privacy />,
  },
  {
    path: "*",
    element: <Navigate to="/pilot" />,
  },
]);
