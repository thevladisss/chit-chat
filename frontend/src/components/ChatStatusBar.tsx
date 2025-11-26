import Icon from "@mdi/react";
import "./ChatStatusBar.css";
import BaseButton from "./base/BaseButton.tsx";
import { mdiArrowLeft } from "@mdi/js";

export default function ChatStatusBar({
  chatName,
  participantsCount,
  onLeaveChat,
}: any) {
  return (
    <div className="chat-status-bar">
      <div className="actions">
        <BaseButton
          onClick={() => onLeaveChat()}
          icon={<Icon path={mdiArrowLeft} size={1} title="Leave" />}
        />
      </div>
      <div className="chat-status-bar-info">
        <h2>{chatName}</h2>
        <p>{participantsCount} members</p>
      </div>
    </div>
  );
}
