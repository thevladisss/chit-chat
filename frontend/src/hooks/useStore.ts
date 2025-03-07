import { useDispatch } from "./useDispatch.ts";
import { IRootState } from "../types/IRootState.ts";

export const useStore = () => {
  const dispatch = useDispatch<IRootState>();
  return {
    dispatch,
  };
};
