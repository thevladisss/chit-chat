import {JSX, useState} from 'react'
import {postRequest} from "../service";

type Props = {
  open:boolean
}
function SignInDialog({ open }: Props): JSX.Element {

  const [value, setValue] = useState('React Component')

  const handleSubmit = async (e) => {
    e.preventDefault()
    postRequest('/api/users')
  }

  return (
    <dialog open={open}>
      <form style={{backgroundColor: "red"}} onSubmit={handleSubmit}>
        <fieldset>
          <div className="form-control">
            <label for="input-username"></label>
            <input type="text" name="username" id="input-username"/>
          </div>

          <button type="submit">
            Sign In
          </button>
        </fieldset>
      </form>
    </dialog>
  )
}


export default SignInDialog
