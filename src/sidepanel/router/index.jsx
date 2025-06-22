import { Navigate, createHashRouter } from "react-router-dom";
import About from "@/sidepanel/pages/About";
import CaseDetail from "@/sidepanel/pages/CaseDetail";
import CasePortal from "@/sidepanel/pages/CasePortal";
import Debug from "@/sidepanel/pages/Debug";
import Entry from "@/sidepanel/pages/Entry";
import Login from "@/sidepanel/pages/Login";
import Privacy from "@/sidepanel/pages/Privacy";

// 全局路由
export const globalRouters = createHashRouter([
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/case-detail",
    element: <CaseDetail />,
  },
  {
    path: "/case-portal",
    element: <CasePortal />,
  },
  {
    path: "/debug",
    element: <Debug />,
  },
  {
    path: "/entry",
    element: <Entry />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/privacy",
    element: <Privacy />,
  },
  {
    path: "*",
    element: <Navigate to="/entry" />,
  },
]);
