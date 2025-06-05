import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UserManager from "@/common/kits/UserManager";
import "./index.less";

/**
 * 页面容器组件
 */
export default function MKPageCore(props: {
  renderPageHeader?: () => React.ReactNode;
  renderPageFooter?: () => React.ReactNode;
  children: React.ReactNode;
}) {
  const { renderPageHeader, renderPageFooter, children } = props || {};

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = async () => {
    const isLoggedIn = await UserManager.checkAuth();
    setIsAuthenticated(isLoggedIn);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // 正在检查登录状态
    return (
      <div className="m-k-page-core-wrap flex min-h-full flex-col items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} delay={500} />
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="m-k-page-core-wrap flex min-h-full flex-col justify-start">
      <div className="flex-0">{renderPageHeader?.()}</div>
      <div className="page-core-content flex h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      <div className="flex-0">{renderPageFooter?.()}</div>
    </div>
  ) : (
    <Navigate to="/login" />
  );
}
