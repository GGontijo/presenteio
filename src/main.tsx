import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <GoogleOAuthProvider clientId="314514300005-1ap4sh8a6llo4kiru71u87b6grctrtjm.apps.googleusercontent.com">
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    </GoogleOAuthProvider>
  );
} else {
  console.error("Elemento 'root' não encontrado no DOM.");
}
