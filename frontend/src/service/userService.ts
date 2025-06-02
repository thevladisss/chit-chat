import { getRequest, postRequest } from "./index";

export const requestSignIn = (username: string) => {
  return postRequest<{ username: string }>("/api/users", {
    username,
  });
};
