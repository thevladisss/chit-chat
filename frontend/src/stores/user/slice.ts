import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "../../types/IUser.ts";
import * as actions from "./actions.ts";

export const slice = createSlice({
  name: "userState",
  initialState: null as IUser | null,
  reducers: {
    setUser: (_, action: PayloadAction<IUser>) => {
      return action.payload;
    },
    signOut: () => {
      return null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      actions.signInAction.fulfilled,
      (_, action: PayloadAction<{ username: string }>) => {
        // Create a user object with the required properties
        const user: IUser = {
          username: action.payload.username,
          chatId: "", // You might want to generate this
          createdTimestamp: new Date().toISOString(),
        };
        return user;
      },
    );
  },
});

export const { setUser, signOut } = slice.actions;

export default slice.reducer;
