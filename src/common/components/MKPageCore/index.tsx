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

  return (
    <div className="m-k-page-core-wrap flex min-h-full flex-col justify-start px-1">
      <div className="flex-0">{renderPageHeader?.()}</div>
      <div className="page-core-content h-0 flex-1 overflow-y-auto">{children}</div>
      <div className="flex-0">{renderPageFooter?.()}</div>
    </div>
  );
}
