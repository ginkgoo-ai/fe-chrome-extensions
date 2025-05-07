import { useEffect } from "react";
import MKHeader from "@/common/components/MKHeader";
import MKModuleCache from "@/common/components/MKModuleCache";
import MKPageCore from "@/common/components/MKPageCore";
import "./index.less";

export default function Debug() {
  useEffect(() => {}, []);

  return (
    <MKPageCore
      renderPageHeader={() => {
        return <MKHeader title="Debug" />;
      }}
    >
      <MKModuleCache />
    </MKPageCore>
  );
}
