import "./AuthView.css";
import { type JSX } from "react";
import SignInForm from "../components/SignInForm.tsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SELECT_CHAT_VIEW_PATH } from "../constants/route-paths.ts";
import { signInAction } from "../stores/user/actions.ts";
import type { AppDispatch } from "../stores";

function AuthView(): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleUserAuthenticate = (username: string) => {
    dispatch(signInAction(username));
    navigate(SELECT_CHAT_VIEW_PATH);
  };

  return (
    <div className="auth-view">
      <SignInForm
        pending={false}
        onUserAuthenticate={handleUserAuthenticate}
      ></SignInForm>
    </div>
  );
}

export default AuthView;
