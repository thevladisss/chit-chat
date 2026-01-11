import "./AuthView.css";
import { type JSX } from "react";
import SignInForm from "../components/SignInForm.tsx";
import { IUser } from "../types/IUser.ts";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CHAT_PATH } from "../constants/route-paths.ts";
import { signInAction } from "../stores/user/actions.ts";
import type { AppDispatch } from "../stores";

function AuthView(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleUserAuthenticate = (user: IUser) => {
    dispatch(signInAction(user.username));
    navigate(CHAT_PATH);
  };

  return (
    <div className="auth-view">
      <SignInForm onUserAuthenticate={handleUserAuthenticate}></SignInForm>
    </div>
  );
}

export default AuthView;
