import MKIcon from "@/common/components/MKIcon";
import MKModuleSupport from "@/common/components/MKModuleSupport";
import GlobalManager from "@/common/kits/GlobalManager";
import imgLogo from "@/resource/oss/assets/app.webp";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import "./index.less";

export default function About(): JSX.Element {
  return (
    <SPPageCore
      renderPageHeader={() => {
        return <SPPageHeader title="About" />;
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-start">
        <div className="mb-8 flex flex-col items-center justify-center">
          <img className="about-up-logo" src={imgLogo} alt="App Logo" />
        </div>
        <div className="mb-1 flex flex-row items-center justify-center">
          <MKIcon size="1rem" src="icon-quot-2" color="rgb(71, 85, 105)" />
          <span className="mt-2 px-2 text-xs text-slate-600">减轻心智负担，提升开发体验</span>
          <MKIcon size="1rem" src="icon-quot-21" color="rgb(71, 85, 105)" />
        </div>
        <div className="mt-2.5 text-sm text-slate-500">
          <span className="mr-[0.1rem]">v</span>
          <span className="mr-[0.1rem]">{GlobalManager.g_version}</span>
          <span>{GlobalManager.g_webenv}</span>
        </div>
      </div>
      <MKModuleSupport />
    </SPPageCore>
  );
}
