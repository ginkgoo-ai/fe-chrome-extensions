import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import MKButton from "@/common/components/MKButton";
import { Button } from "@/common/components/ui/button";
import UserManager from "@/common/kits/UserManager";

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
    <div className="flex-0 flex h-10 flex-row items-center justify-between p-4">
      <div className="flex-0 w-5">
        {!!onBtnBackClick && (
          <MKButton type="text" onClick={handleBtnBackClick}>
            <ArrowLeft size={20} />
          </MKButton>
        )}
      </div>
      <div className="flex-1 whitespace-nowrap text-center font-bold">{title}</div>
      <div className="flex-0 w-5">
        <MKButton type="primary" shape="circle">
          {profileName}
        </MKButton>
      </div>
    </div>
  );
}
