import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import MKButton from "@/common/components/MKButton";
import UserManager from "@/common/kits/UserManager";
import imgLogo from "@/resource/oss/assets/imgLogo.png";

interface SPPageHeaderProps {
  title?: string;
  onBtnBackClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function SPPageHeader(props: SPPageHeaderProps) {
  const { title, onBtnBackClick } = props;
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    const { first_name = "", last_name = "" } = UserManager.userInfo || {};

    setProfileName(first_name?.toString()?.charAt(0)?.toUpperCase() + last_name?.toString()?.charAt(0)?.toUpperCase());
  }, []);

  const handleBtnBackClick = (e: any) => {
    onBtnBackClick?.(e);
  };

  return (
    <div className="flex flex-col">
      <div className="flex-0 box-border flex h-14 flex-row items-center justify-between bg-[#F9F9F9] px-6">
        <img src={imgLogo} className="w-[180px]" alt="logo" />
        <div className="flex-0 w-auto">
          <MKButton type="primary" shape="circle">
            {profileName}
          </MKButton>
        </div>
      </div>
      <div className="flex-0 flex h-10 flex-row items-center justify-between px-4 py-6">
        {!!onBtnBackClick && (
          <div className="flex-0 w-auto">
            <MKButton type="text" onClick={handleBtnBackClick}>
              <ArrowLeft size={20} />
            </MKButton>
          </div>
        )}

        <div className="box-border w-0 flex-1 truncate pl-1 text-start text-xl font-bold">{title}</div>
        {/* <div className="flex-0 w-5"></div> */}
      </div>
    </div>
  );
}
