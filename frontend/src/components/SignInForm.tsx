import "./SignInForm.css";
import { type BaseSyntheticEvent, JSX, useState } from "react";
import { postRequest } from "../service";
import BaseTextField from "./base/BaseTextField.tsx";
import BaseButton from "./base/BaseButton.tsx";
import { useDispatch } from "../hooks/useDispatch.ts";
import { signInAction } from "../stores/user/actions.ts";
import { useUser } from "../hooks/useUser.tsx";

type Props = {
  onUserAuthenticate: (user: any) => void;
};
function SignInForm({ onUserAuthenticate }: Props): JSX.Element {
  const { signUpUser } = useUser();
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
          <legend style={{ width: "100%", marginBottom: "8px" }}>
            <h1 style={{ textAlign: "center", fontSize: "56px" }}>Welcome</h1>
          </legend>
          <h2 style={{ textAlign: "center", fontSize: "24px", margin: 0, marginTop: "8px", marginBottom: "8px" }}>
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
