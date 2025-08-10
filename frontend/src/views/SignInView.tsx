import "./SignInView.css";
import { type JSX } from "react";
import SignInForm from "../components/SignInForm.tsx";
import { IUser } from "../types/IUser.ts";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser.tsx";

function SignInView(): JSX.Element {
  const navigate = useNavigate();
  const { signUpUser } = useUser();

  const handleUserAuthenticate = (user: IUser) => {
    signUpUser(user.username);
    navigate("/chat");
  };

  return (
    <div className="sign-in-view">
      <SignInForm onUserAuthenticate={handleUserAuthenticate}></SignInForm>
    </div>
  );
}

export default SignInView;
