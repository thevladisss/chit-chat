import  {type JSX, useState} from 'react'
import SignInForm from "../components/SignInForm.tsx";
import {IUser} from "../types/IUser.ts";

function SignInView(props: any): JSX.Element {
  const [user, setUser] = useState<IUser | null>(null);
  const handleUserAuthenticate = (user: IUser) => {
    setUser(user)
  }

  return (
    <div className="sign-up-view">
      <SignInForm onUserAuthenticate={handleUserAuthenticate}></SignInForm>
    </div>
  )
}


export default SignInView
