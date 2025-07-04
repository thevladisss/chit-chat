import "./SignInForm.css";
import { type BaseSyntheticEvent, JSX, useState } from "react";
import BaseTextField from "./base/BaseTextField.tsx";
import BaseButton from "./base/BaseButton.tsx";
import { useUserStore } from "../hooks/useUserStore.tsx";
import { IUser } from "../types/IUser.ts";

type Props = {
  // Note: This prop is passed but not currently used in the component
  onUserAuthenticate: (user: IUser) => void;
};
function SignInForm({ onUserAuthenticate }: Props): JSX.Element {
  const { signUpUser } = useUserStore();
  const [username, setUsername] = useState("");

  const handleInputUsername = (
    e: BaseSyntheticEvent<InputEvent, HTMLInputElement>,
  ) => {
    if (e.target?.value) {
      setUsername(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    signUpUser(username);
  };

  return (
    <div className="sign-in-form">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>
            <h1>Welcome</h1>
          </legend>
          <h2>
            Please enter your username
          </h2>
          <BaseTextField
            immediateFocus
            size="large"
            placeholder="John Doe..."
            onInput={handleInputUsername}
            value={username}
            required
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
