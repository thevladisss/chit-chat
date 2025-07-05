import "./SidebarUserInformation.css";
import Icon from "@mdi/react";
import { mdiLogout } from "@mdi/js";
import BaseButton from "./base/BaseButton.tsx";

type Props = {
  username: string;
};

function SidebarUserInformation({ username }: Props): JSX.Element {
  return (
    <div className="flex justify-between align-center sidebar-user-info">
      <h2>
        👉 Hello, <strong>{username}</strong>
      </h2>
      <div className="user-controls">
        <BaseButton
          icon={<Icon path={mdiLogout} size={1} title="Logout" />}
        ></BaseButton>
      </div>
    </div>
  );
}

export default SidebarUserInformation;
