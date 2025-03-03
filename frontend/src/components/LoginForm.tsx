import "./SignInForm.css"
import { JSX, useState, ChangeEvent} from 'react'
import {postRequest} from "../service";

type Props = {
  onUserAuthenticate: (user: any) => void;
};
function SignInForm({onUserAuthenticate}: Props): JSX.Element {

  const [username, setUsername] = useState('')

  const handleInputUsername = (e: ChangeEvent) => {

    if (e.target?.value) {
      setUsername(e.target.value)
    }
  }

  const [isPendingAuthentication,setAuthenticationStatus ] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setAuthenticationStatus(true);
      const { data } = await postRequest('/api/users', {
        username
      })

      onUserAuthenticate(data)
    }
    catch(e) {
    //todo: handle error
    }
    finally {
      setAuthenticationStatus(false);
    }
  }


  return (
    <div className="sign-in-form">
      <form style={{backgroundColor: "black"}} onSubmit={handleSubmit}>
        <fieldset>
          <div className="form-control">
            <label htmlFor="input-username"></label>
            <input onChange={handleInputUsername} value={username} type="text" name="username" id="input-username"/>
          </div>

          <button type="submit">
            Sign In
          </button>
        </fieldset>
      </form>
    </div>
  )
}


export default SignInForm
