import { memo, useEffect, useState } from "react";
import MKButton from "@/common/components/MKButton";
import UserManager from "@/common/kits/UserManager";

interface SPPageHeaderProps {
  title?: string;
}

export default function SPPageHeader(props: SPPageHeaderProps) {
  const { title } = props;
  const [profileName, setProfileName] = useState<string>("");

  useEffect(() => {
    const { first_name = "", last_name = "" } = UserManager.userInfo || {};

    setProfileName(first_name?.toString()?.charAt(0)?.toUpperCase() + last_name?.toString()?.charAt(0)?.toUpperCase());
  }, []);

  return (
    <div className="flex-0 flex h-10 flex-row items-center justify-between p-4">
      <div className="flex-0 w-5"></div>
      <div className="flex-1 whitespace-nowrap text-center font-bold">{title}</div>
      <div className="flex-0 w-5">
        <MKButton type="primary" shape="circle">
          {profileName}
        </MKButton>
      </div>
    </div>
  );
}
