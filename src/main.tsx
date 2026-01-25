import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MantineProvider } from "@mantine/core";
import SessionProvider from "./context/session-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </MantineProvider>
  </StrictMode>
);
