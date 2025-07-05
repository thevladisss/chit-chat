import "./SidebarUserInformation.css";

type Props = {
  username: string;
}

function SidebarUserInformation({ username }: Props): JSX.Element {
  return (
    <div
      className="flex justify-between align-center sidebar-user-info"
    >
      <h2>
        👉 Hello, <strong>{username}</strong>
      </h2>
      <div className="user-controls">

      </div>
    </div>
  );
}

export default SidebarUserInformation;
