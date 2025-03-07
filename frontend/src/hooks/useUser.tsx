import { useSelector } from "react-redux";
import { IRootState } from "../types/IRootState.ts";

export const useUser = () => {
  const signUpUser = (username) => {};

  const user = useSelector<IRootState>((state) => {
    return state.user;
  });

  return {
    user,
    signUpUser,
  };
};
