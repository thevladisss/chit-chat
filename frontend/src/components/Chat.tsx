import "./Chat.css"
import  {JSX, useState} from 'react'

function Chat({style}: any): JSX.Element {

  const [value, setValue] = useState('React Component')

  return (
    <div className="chat" style={style}>
      {value}
    </div>
  )
}


export default Chat
