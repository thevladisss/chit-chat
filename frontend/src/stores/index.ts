import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/slice.ts";
import chatsReducer from "./chat/slice.ts";

const store = configureStore({
  reducer: {
    userState: userReducer,
    chatState: chatsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
