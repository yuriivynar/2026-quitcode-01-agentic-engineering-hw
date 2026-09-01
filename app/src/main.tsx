import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PorscheDesignSystemProvider } from "@porsche-design-system/components-react";
import "@porsche-design-system/components-react/index.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PorscheDesignSystemProvider>
      <App />
    </PorscheDesignSystemProvider>
  </StrictMode>,
);
