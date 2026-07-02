import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types/IUser.ts";
import * as actions from "./actions.ts";

export type UserSliceState = IUser | null;

export const slice = createSlice({
  name: "userState",
  initialState: (): UserSliceState => null,
  reducers: {
    setUser: (_, action) => {
      return {
        ...action.payload,
      };
    },
    signOut: () => {
      return null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      actions.signInAction.fulfilled,
      (state, action: PayloadAction<IUser>) => {
        return {
          ...(state ?? {}),
          id: action.payload.id,
          username: action.payload.username,
          createdAt: action.payload.createdAt,
          userId: action.payload.userId,
        };
      },
    );

    //TODO: Add pending and rejected handling for signInAction
  },
});

export const { setUser, signOut } = slice.actions;

export default slice.reducer;
