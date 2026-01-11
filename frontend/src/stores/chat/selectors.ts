import { IRootState } from "../../types/IRootState.ts";

export const selectUser = (state: IRootState) => state.userState;

export const selectUserName = (state: IRootState) => state.userState?.username;
