import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "./router";
import App from "./routes";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider>
      <App />
    </RouterProvider>
  </StrictMode>,
);
