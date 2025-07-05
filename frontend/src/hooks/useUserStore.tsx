import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../types/IRootState.ts";
import { signInAction } from "../stores/user/actions.ts";
import { selectUser } from "../stores/chat/selectors.ts";
import { IUser } from "../types/IUser.ts";

export const useUserStore = () => {
  const dispatch = useDispatch();
  const signUpUser = (username: string) => {
    dispatch<any>(signInAction(username));
  };

  const user = useSelector<IRootState, IUser | null>(selectUser);

  return {
    user,
    signUpUser,
  };
};
