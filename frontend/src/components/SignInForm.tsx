import "./SignInForm.css";
import { type BaseSyntheticEvent, JSX, useState } from "react";
import TextField from "./base/TextField.tsx";
import BaseButton from "./base/BaseButton.tsx";
import { useUser } from "../hooks/useUser.tsx";

type Props = {
  // Note: This prop is passed but not currently used in the component
  onUserAuthenticate: (user: IUser) => void;
};
function SignInForm({ onUserAuthenticate }: Props): JSX.Element {
  const { signUpUser } = useUserStore();
  const [username, setUsername] = useState("");

  const handleInputUsername = (
    e: BaseSyntheticEvent<InputEvent, HTMLInputElement>
  ) => {
    if (e.target?.value) {
      setUsername(e.target.value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signUpUser(username);
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
          <TextField
            name="username"
            immediateFocus={true}
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
