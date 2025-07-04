import { IRootState } from "../../types/IRootState.ts";

export const selectUser = (state: IRootState) => state.userState;
