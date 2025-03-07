import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../types/IUser.ts";
import * as actions from "./actions.ts";
import { RootState } from "../index.ts";
export const slice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      actions.signInAction.fulfilled,
      (state: RootState, action) => {
        return action.payload;
      },
    );
  },
});

export const { setUser } = slice.actions;

export default slice.reducer;
