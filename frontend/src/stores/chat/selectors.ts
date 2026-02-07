import { type RootState } from "../index.ts";

export const selectUser = (state: RootState) => state.userState;

export const selectUserName = (state: RootState) => state.userState?.username;
