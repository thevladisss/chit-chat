import React from "react";

function SidebarUserInformation({ username }: any): JSX.Element {
  return (
    <div
      className="flex justify-between align-center"
      style={{ padding: "8px" }}
    >
      <h2>
        👉 Hello, <strong>{username}</strong>
      </h2>
    </div>
  );
}

export default SidebarUserInformation;
