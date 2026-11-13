import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Sanctuary } from "./components/Sanctuary";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sanctuary />
  </StrictMode>,
);
