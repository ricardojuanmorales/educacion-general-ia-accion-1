import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./egia/presentacion/App";
import "./egia/presentacion/estilos.css";

const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("Falta el contenedor #raiz en index.html");

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
