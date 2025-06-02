import { useSelector } from "react-redux";
import { IRootState } from "../types/IRootState.ts";
import { useDispatch } from "./useDispatch.ts";
import { signInAction } from "../stores/user/actions.ts";

export const useUser = () => {
  const dispatch = useDispatch();
  const signUpUser = (username: string) => {
    dispatch(signInAction(username));
  };

  const user = useSelector<IRootState>((state) => {
    return state.user;
  });

  return {
    user,
    signUpUser,
  };
};
