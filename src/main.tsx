import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GiftRegistry from "./giftRegistry";
import Layout from "@/layout";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="314514300005-1ap4sh8a6llo4kiru71u87b6grctrtjm.apps.googleusercontent.com">
    <StrictMode>
      <Layout>
        <GiftRegistry />
      </Layout>
    </StrictMode>
  </GoogleOAuthProvider>
);
