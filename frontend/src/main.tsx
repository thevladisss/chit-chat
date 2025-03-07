import {createRoot} from "react-dom/client";
import "./index.css"
import App from "./App.tsx"
import {Provider} from "react-redux";
import store from "./stores"
import {type ReactNode} from "react"

createRoot(document.getElementById('app')).render(
  <Provider store={store}>
    <App />
  </Provider> as ReactNode
)
