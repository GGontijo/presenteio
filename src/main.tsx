import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GiftRegistry from "./giftRegistry";
import Layout from "@/layout";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorPage from "./ErrorPage";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="314514300005-1ap4sh8a6llo4kiru71u87b6grctrtjm.apps.googleusercontent.com">
    <StrictMode>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<GiftRegistry />} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StrictMode>
  </GoogleOAuthProvider>
);
