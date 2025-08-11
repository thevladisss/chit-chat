import { createAsyncThunk } from "@reduxjs/toolkit";
import { requestSignIn } from "../../service/userService.ts";

export const signInAction = createAsyncThunk(
  "user/getUser",
  async (username: string) => {
    const { data } = await requestSignIn(username);

    return data;
  },
);

export const signOutAction = () => ({
  type: "user/signOut",
});
