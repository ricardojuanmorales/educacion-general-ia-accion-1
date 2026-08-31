// Punto único de entrada al contenido canónico. Los JSON viven en `contenido/` en la raíz del
// repositorio, fuera de la aplicación: son el contenido aprobado, no código de la app.

import datosRetos from "../../../../../contenido/retos/retos_egia_quest_v0-1.json";
import datosDilemas from "../../../../../contenido/dilemas/dilemas_egia_quest_v0-1.json";
import { cargarRetos, type CatalogoDeRetos } from "./cargar-retos";
import { cargarDilemas } from "./cargar-dilemas";
import type { Dilema } from "../dominio/dilema";

export const CATALOGO_RETOS: CatalogoDeRetos = cargarRetos(datosRetos);
export const CATALOGO_DILEMAS: readonly Dilema[] = cargarDilemas(datosDilemas);
