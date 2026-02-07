import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/slice.ts";
import chatsReducer from "./chat/slice.ts";
import type { UserSliceState } from "./user/slice.ts";
import type { ChatSliceState } from "./chat/slice.ts";

const store = configureStore({
  reducer: {
    userState: userReducer,
    chatState: chatsReducer,
  },
});

export type RootState = {
  userState: UserSliceState;
  chatState: ChatSliceState;
};

export type AppDispatch = typeof store.dispatch;

export default store;
