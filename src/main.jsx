import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { registerMissionProofPwa } from "./lib/pwa/registerPwa.js";
import "./styles.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

registerMissionProofPwa();
