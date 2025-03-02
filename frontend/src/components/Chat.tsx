import  {JSX, useState} from 'preact/compat'

function Chat(props: any): JSX.Element {

  const [value, setValue] = useState('React Component')

  return (
    <div>
      {value}
    </div>
  )
}


export default Chat
