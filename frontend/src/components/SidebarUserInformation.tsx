import React from "react";
import "./SidebarUserInformation.css";

function SidebarUserInformation({ username }: any): JSX.Element {
  return (
    <div
      className="flex justify-between align-center sidebar-user-info"
    >
      <h2>
        👉 Hello, <strong>{username}</strong>
      </h2>
    </div>
  );
}

export default SidebarUserInformation;
