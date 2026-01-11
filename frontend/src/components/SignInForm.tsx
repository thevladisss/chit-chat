import "./SignInForm.css";
import { type BaseSyntheticEvent, JSX, useState } from "react";
import BaseTextField from "./base/BaseTextField.tsx";
import BaseButton from "./base/BaseButton.tsx";
import { useDispatch } from "react-redux";
import { IUser } from "../types/IUser.ts";
import { signInAction } from "../stores/user/actions.ts";
import type { AppDispatch } from "../stores";

type Props = {
  // Note: This prop is passed but not currently used in the component
  onUserAuthenticate: (user: IUser) => void;
};
function SignInForm({ onUserAuthenticate }: Props): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const [username, setUsername] = useState("");

  const handleInputUsername = (
    e: BaseSyntheticEvent<InputEvent, HTMLInputElement>
  ) => {
    setUsername(e.target.value.trim());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(signInAction(username));
  };

  return (
    <div className="sign-in-form">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>
            <h1>
              <span>Chit-Chat:</span> Your instant chatting application
            </h1>
          </legend>
          <h2>Come up with the unique username and proceed with chatting</h2>
          <BaseTextField
            name="username"
            immediateFocus={true}
            placeholder="John Doe..."
            onInput={handleInputUsername}
            value={username}
            required
            autoFocus
          />
        </fieldset>

        <div className="sign-in-form-actions">
          <BaseButton type="submit">Proceed</BaseButton>
        </div>
      </form>
    </div>
  );
}

export default SignInForm;
