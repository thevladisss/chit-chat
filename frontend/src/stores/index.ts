import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/slice.ts";

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;

export default store;
