import { useEffect } from "react";
import MKModuleCache from "@/common/components/MKModuleCache";
import SPPageCore from "@/sidepanel/components/SPPageCore";
import SPPageHeader from "@/sidepanel/components/SPPageHeader";
import "./index.less";

export default function Debug() {
  useEffect(() => {}, []);

  return (
    <SPPageCore
      renderPageHeader={() => {
        return <SPPageHeader title="Debug" />;
      }}
    >
      <MKModuleCache />
    </SPPageCore>
  );
}
