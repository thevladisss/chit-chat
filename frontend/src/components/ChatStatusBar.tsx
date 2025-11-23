import "./ChatStatusBar.css";

export default function ChatStatusBar({ chatName, participantsCount }: any) {
  return (
    <div className="chat-status-bar">
      <div className="chat-status-bar-info">
        <h2>{chatName}</h2>
        <p>{participantsCount} members</p>
      </div>
    </div>
  );
}
