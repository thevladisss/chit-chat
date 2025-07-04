import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../types/IUser.ts";
import * as actions from "./actions.ts";

export const slice = createSlice({
  name: "userState",
  initialState: null,
  reducers: {
    setUser: (_, action: PayloadAction<IUser>) => {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      actions.signInAction.fulfilled,
      (_, action: PayloadAction<IUser>) => {
        return action.payload;
      },
    );
  },
});

export const { setUser } = slice.actions;

export default slice.reducer;
