import React, { PropsWithChildren } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import userReducer from "../src/stores/user/slice.ts";
import chatsReducer from "../src/stores/chat/slice.ts";
import type { RootState } from "../src/stores";

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      userState: userReducer,
      chatState: chatsReducer,
    },
    preloadedState: preloadedState as RootState,
  });
}

type AppStore = ReturnType<typeof setupStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export async function renderWithProviders(
  ui: React.ReactElement,
  extendedRenderOptions: ExtendedRenderOptions = {},
) {
  const {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  } = extendedRenderOptions;

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  const screen = await render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    store,
    ...screen,
  };
}
