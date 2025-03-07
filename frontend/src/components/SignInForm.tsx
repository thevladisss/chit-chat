import "./SignInForm.css";
import { type BaseSyntheticEvent, JSX, useState } from "react";
import { postRequest } from "../service";
import TextField from "./base/TextField.tsx";
import BaseButton from "./base/BaseButton.tsx";
import { useDispatch } from "../hooks/useDispatch.ts";
import { signInAction } from "../stores/user/actions.ts";

type Props = {
  onUserAuthenticate: (user: any) => void;
};
function SignInForm({ onUserAuthenticate }: Props): JSX.Element {
  const dispatch = useDispatch();

  const [username, setUsername] = useState("");

  const handleInputUsername = (
    e: BaseSyntheticEvent<InputEvent, HTMLInputElement>,
  ) => {
    if (e.target?.value) {
      setUsername(e.target.value);
    }
  };

  const [isPendingAuthentication, setAuthenticationStatus] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setAuthenticationStatus(true);

      dispatch(signInAction(username));
    } catch (e) {
      //todo: handle error
    } finally {
      setAuthenticationStatus(false);
    }
  };

  return (
    <div className="sign-in-form">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <TextField
            label="Username"
            onInput={handleInputUsername}
            value={username}
          />
        </fieldset>

        <div className="sign-in-form-actions">
          <BaseButton type="submit">Sign In</BaseButton>
        </div>
      </form>
    </div>
  );
}

export default SignInForm;
