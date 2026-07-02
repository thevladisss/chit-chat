import { IUser } from "../types/IUser";
import { postRequest } from "./index";

export const requestSignIn = (username: string) => {
  return postRequest<IUser>("/api/users", {
    username,
  });
};
