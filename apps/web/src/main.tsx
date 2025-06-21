import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

type Page = { default: () => ReactNode };

(async () => {
  let App: Page;

  switch (window.location.pathname) {
    case "/":
      App = (await import("./page.tsx")) as unknown as Page;
      break;
    default:
      App = (await import("./404.tsx")) as unknown as Page;
  }

  const Comp = App.default;

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Comp />
    </StrictMode>,
  );
})();
