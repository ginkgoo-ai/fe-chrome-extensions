import "./index.less";

interface IModuleLoadingProps {
  label?: string;
}

export default function MKModuleLoading(props: IModuleLoadingProps) {
  const { label = "Loading" } = props || {};

  return (
    <div className="whitespace-nowrap">
      <span>{label}</span>
      <span className="loading-dot ml-1">.</span>
      <span className="loading-dot ml-1">.</span>
      <span className="loading-dot ml-1">.</span>
    </div>
  );
}
