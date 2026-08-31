// Punto único de entrada al contenido canónico. Los JSON viven en `contenido/` en la raíz del
// repositorio, fuera de la aplicación: son el contenido aprobado, no código de la app.

import datosRetos from "../../../../../contenido/retos/retos_egia_quest_v0-1.json";
import datosDilemas from "../../../../../contenido/dilemas/dilemas_egia_quest_v0-1.json";
import datosGlosario from "../../../../../contenido/glosario/glosario_egia_quest_v0-1.json";
import datosHerramientas from "../../../../../contenido/herramientas/herramientas_egia_quest_v0-1.json";
import { cargarRetos, type CatalogoDeRetos } from "./cargar-retos";
import { cargarDilemas } from "./cargar-dilemas";
import { cargarGlosario, cargarHerramientas } from "./cargar-referencia";
import type { Dilema } from "../dominio/dilema";
import type { FichaHerramienta, TerminoGlosario } from "../dominio/referencia";

export const CATALOGO_RETOS: CatalogoDeRetos = cargarRetos(datosRetos);
export const CATALOGO_DILEMAS: readonly Dilema[] = cargarDilemas(datosDilemas);
export const GLOSARIO: readonly TerminoGlosario[] = cargarGlosario(datosGlosario);
export const HERRAMIENTAS: readonly FichaHerramienta[] = cargarHerramientas(datosHerramientas);

/** El método del glosario, tomado del propio contenido: se muestra en pantalla, no se reescribe. */
export const METODO_GLOSARIO: string = String(
  (datosGlosario as { metodo?: unknown }).metodo ?? "",
);

/** Por qué las fichas describen tipos y no productos. También viene del contenido aprobado. */
export const DECISION_HERRAMIENTAS: string = String(
  (datosHerramientas as { decision_de_diseno?: unknown }).decision_de_diseno ?? "",
);
