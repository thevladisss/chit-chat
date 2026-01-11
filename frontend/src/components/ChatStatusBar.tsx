import Icon from "@mdi/react";
import "./ChatStatusBar.css";
import BaseButton from "./base/BaseButton.tsx";
import { mdiArrowLeft, mdiPhone, mdiVideo } from "@mdi/js";
import { useScreen } from "../hooks/useScreen.ts";

type Props = {
  chatName: string;
  participantsCount: number;
  onLeaveChat: () => void;
  onVideoCall: () => void;
  onAudioCall: () => void;
};

export default function ChatStatusBar({
  chatName,
  participantsCount,
  onLeaveChat,
  onVideoCall,
  onAudioCall,
}: Props) {
  const { smAndSmaller } = useScreen();
  return (
    <div className="chat-status-bar">
      {smAndSmaller && (
        <div className="actions">
        <BaseButton
            onClick={() => onLeaveChat()}
            icon={<Icon path={mdiArrowLeft} size={1} title="Leave" />}
          />
        </div>
      )}
      <div className="chat-status-bar-info">
        <h2>{chatName}</h2>
        <p>{participantsCount} members</p>
      </div>
      <div className="actions">
        <BaseButton
          onClick={() => onAudioCall()}
          icon={<Icon path={mdiPhone} size={1} title="Video Call" />}
        />
        <BaseButton
          onClick={() => onVideoCall()}
          icon={<Icon path={mdiVideo} size={1} title="Video Call" />}
        />
      </div>
    </div>
  );
}
