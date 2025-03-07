import "./ChatsList.css"
import {useState, JSX, HTMLProps} from 'react'
import {buildClasses} from "../utils/classes.ts";
import {IChatListItem} from "../types/IChatListItem.ts";


type Props = HTMLProps<HTMLDivElement> & {
  chats: IChatListItem[]
  prospectiveChats: any[]
  selectedChatId: string | null;
  onSelectExistingChat: (chat: IChatListItem) => void;
  onSelectProspectiveChat: (chat: IChatListItem) => void;
}
function ChatsList({
 className,
  style,
  chats,
  prospectiveChats,
  selectedChatId,
  onSelectChat
 }: Props): JSX.Element {

  const classes = buildClasses('chat-list', className ?? '');
  const getLiClasses = (chat: IChatListItem) =>  {
    return "chat-list-item" + (chat.id === selectedChatId ? " chat-list-item--active" : "")
  }


  return (
    <div style={style} className={classes}>
      <ul>
        {
          chats.map((chat) => {
            return (<li className={getLiClasses(chat)} key={chat.id}>
              <a role="button" onClick={() => onSelectChat(chat)}>
                Chat
              </a>
            </li>)
          })
        }
        {
          prospectiveChats.map((user) => {
            return (<li className={getLiClasses(user)} key={user.id}>
              <a role="button" onClick={() => onSelectChat(user)}>
                {user.username}
              </a>
            </li>)
          })
        }
      </ul>
    </div>
  )
}


export default ChatsList
