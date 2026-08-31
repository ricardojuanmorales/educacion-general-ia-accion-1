import type { Dilema, EjeIbata, OpcionDilema } from "../dominio/dilema";
import { CALIDADES, EJES_IBATA } from "../dominio/dilema";
import { ErrorDeContenido } from "./cargar-retos";

/**
 * Carga los dilemas validados en Fase 1 y comprueba en tiempo de ejecución la regla que
 * define la mecánica (DEC-EGIA-026): toda opción muestra consecuencia, y toda decisión que
 * deja daño ofrece reparación.
 */
export function cargarDilemas(datos: unknown): readonly Dilema[] {
  if (
    typeof datos !== "object" ||
    datos === null ||
    !Array.isArray((datos as { dilemas?: unknown }).dilemas)
  ) {
    throw new ErrorDeContenido("El catálogo no tiene una lista de dilemas");
  }

  const crudos = (datos as { dilemas: Record<string, unknown>[] }).dilemas;
  const salida: Dilema[] = [];

  for (const crudo of crudos) {
    const id = String(crudo.id ?? "");
    if (!/^EGIA-D-\d{3}$/.test(id)) {
      throw new ErrorDeContenido(`Identificador de dilema inválido: ${id}`);
    }

    const eje = crudo.eje_ibata as EjeIbata;
    if (!(EJES_IBATA as readonly string[]).includes(eje)) {
      throw new ErrorDeContenido(`Eje IBATA desconocido: ${String(eje)}`, id);
    }

    const opcionesCrudas = Array.isArray(crudo.opciones) ? crudo.opciones : [];
    if (opcionesCrudas.length !== 4) {
      throw new ErrorDeContenido("Un dilema tiene exactamente cuatro opciones", id);
    }

    const opciones: OpcionDilema[] = opcionesCrudas.map((o: Record<string, unknown>) => {
      const calidad = o.calidad as OpcionDilema["calidad"];
      if (!(CALIDADES as readonly string[]).includes(calidad)) {
        throw new ErrorDeContenido(`Calidad desconocida: ${String(calidad)}`, id);
      }
      const consecuencia = String(o.consecuencia ?? "");
      if (consecuencia.trim().length === 0) {
        throw new ErrorDeContenido(
          `La opción ${String(o.id)} no muestra consecuencia: sin consecuencia es una trivia`,
          id,
        );
      }
      const reparacion = typeof o.reparacion === "string" ? o.reparacion : null;
      if (calidad !== "cuidadosa" && !reparacion) {
        throw new ErrorDeContenido(
          `La opción ${String(o.id)} es «${calidad}» y no ofrece reparación (DEC-EGIA-026)`,
          id,
        );
      }
      return {
        id: o.id as OpcionDilema["id"],
        texto: String(o.texto ?? ""),
        calidad,
        consecuencia,
        reparacion,
      };
    });

    const cuidadosas = opciones.filter((o) => o.calidad === "cuidadosa").length;
    if (cuidadosas === 0) {
      throw new ErrorDeContenido("Un dilema sin salida cuidadosa enseña impotencia", id);
    }
    if (cuidadosas === opciones.length) {
      throw new ErrorDeContenido("Un dilema con las cuatro opciones cuidadosas no es un dilema", id);
    }

    salida.push({
      id,
      titulo: String(crudo.titulo ?? ""),
      nivel: String(crudo.nivel ?? ""),
      ejeIbata: eje,
      practicaRelacionada:
        typeof crudo.practica_relacionada === "number" ? crudo.practica_relacionada : null,
      competencias: Array.isArray(crudo.competencias) ? (crudo.competencias as string[]) : [],
      sensibilidad: String(crudo.sensibilidad ?? ""),
      escenario: String(crudo.escenario ?? ""),
      pregunta: String(crudo.pregunta ?? ""),
      opciones,
      reflexionPosterior: String(crudo.reflexion_posterior ?? ""),
      puntosBase: typeof crudo.puntos_base === "number" ? crudo.puntos_base : 0,
    });
  }

  return salida;
}
