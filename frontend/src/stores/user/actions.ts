import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { requestSignIn } from "../../service/userService.ts";
import { AxiosResponse } from "axios";

export const signInAction = createAsyncThunk(
  "user/getUser",
  async (username: string) => {
    const { data } = await requestSignIn(username);

    return data;
  },
);
