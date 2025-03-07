import { getRequest, postRequest } from "./index";

export const requestSignIn = (username: string) => {
  return postRequest<any>("/api/users", {
    username,
  });
};
