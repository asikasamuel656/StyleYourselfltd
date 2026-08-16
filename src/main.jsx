import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import "./lib/posthog";

import { ThemeProvider } from "./context/ThemeContext";
import { StoreProvider } from "./context/StoreContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <StoreProvider>
      <App />
    </StoreProvider>
  </ThemeProvider>
);
