import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import store from "./store";
import "./Css.css";
import "./App.css";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
const clientId =
  "600601136064-khfncq42d4vffbaeuqvlgbv8ci94ibvr.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
