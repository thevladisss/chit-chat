import {JSX, useState} from 'react'
import {postRequest} from "../service";
import './SignInDialog.css';

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
      <form className="sign-in-dialog-form" onSubmit={handleSubmit}>
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
