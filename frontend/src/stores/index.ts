import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/slice.ts";
import chatsReducer from "./chat/slice.ts";

const store = configureStore({
  reducer: {
    userState: userReducer,
    chatState: chatsReducer,
  },
});

export type AppDispatch = ReturnType<typeof store.dispatch>;

export default store;
