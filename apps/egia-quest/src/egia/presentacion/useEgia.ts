// Estado de la aplicación. Una sola fuente: el proyecto que devuelve el motor heredado,
// más el estado propio de los dilemas, que el motor no modela (DEUDA-EGIA-021).
//
// Regla: ninguna acción de la interfaz calcula el estado siguiente por su cuenta. Se llama al
// caso de uso, y el proyecto que este devuelve es el nuevo estado. Si el motor rechaza, se
// lanza el error para que la pantalla lo muestre junto al control que lo provocó.

import { useCallback, useEffect, useMemo, useState } from "react";

import type { CreativeProject, Evidence } from "../../core/domain/model";
import type { PortfolioItemId, ProjectId } from "../../core/domain/types";
import type { CreativeCycleProjectResult } from "../../core/application/creative-cycle-contracts";
import { CATALOGO_DILEMAS, CATALOGO_RETOS } from "../contenido/catalogo";
import { ESTADO_DILEMAS_VACIO, type Calidad, type EstadoDilemas } from "../dominio/dilema";
import { calcularProgreso } from "../dominio/progreso";
import type { RetoMetadata } from "../dominio/reto";
import { crearRuntime, type Runtime } from "./runtime";
import type { DestinoEvidencia } from "./PantallaReto";

export interface EstadoEgia {
  readonly cargando: boolean;
  readonly errorFatal: string | null;
  readonly proyecto: CreativeProject | null;
  readonly estadoDilemas: EstadoDilemas;
  readonly progreso: ReturnType<typeof calcularProgreso>;
  readonly retos: readonly RetoMetadata[];
  readonly titulos: ReadonlyMap<string, string>;
  readonly puntosPosibles: number;
  accionesDeReto(reto: RetoMetadata): {
    iniciar: () => Promise<void>;
    guardarActividad: (texto: string) => Promise<void>;
    crearEvidencia: (resumen: string) => Promise<void>;
    guardarReflexion: (texto: string) => Promise<void>;
    decidirEvidencia: (destino: DestinoEvidencia, justificacion: string) => Promise<void>;
  };
  resolverDilema(
    dilemaId: string,
    opcionId: "a" | "b" | "c" | "d",
    justificacion: string,
    reparacionAceptada: boolean,
  ): Promise<void>;
  curar(evidenciaId: Evidence["id"], titulo: string): Promise<void>;
  retirar(itemId: PortfolioItemId): Promise<void>;
  borrarTodo(): Promise<void>;
}

/** Un `Result` del núcleo se convierte en excepción para que la pantalla la muestre. */
function exigir(resultado: Awaited<CreativeCycleProjectResult>): CreativeProject {
  if (!resultado.ok) throw new Error(resultado.error.safeMessage);
  return resultado.value;
}

export function useEgia(runtimeInyectado?: Runtime): EstadoEgia {
  const runtime = useMemo(() => runtimeInyectado ?? crearRuntime(), [runtimeInyectado]);

  const [proyecto, setProyecto] = useState<CreativeProject | null>(null);
  const [estadoDilemas, setEstadoDilemas] = useState<EstadoDilemas>(ESTADO_DILEMAS_VACIO);
  const [cargando, setCargando] = useState(true);
  const [errorFatal, setErrorFatal] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      try {
        const p = await runtime.cargarOCrear();
        if (!vivo) return;
        setProyecto(p);
        setEstadoDilemas(runtime.dilemas.leer());
      } catch (error) {
        if (vivo) {
          setErrorFatal(
            error instanceof Error ? error.message : "No se pudo abrir tu portafolio local.",
          );
        }
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [runtime]);

  const retos = useMemo(() => [...CATALOGO_RETOS.porReto.values()], []);

  const titulos = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const meta of retos) {
      const def = CATALOGO_RETOS.definiciones.find((d) => d.id === meta.missionId);
      // El título del motor lleva el prefijo «EGIA-R-NNN · »; aquí solo queremos el nombre.
      mapa.set(meta.retoId, def ? def.title.replace(/^.*?·\s*/, "") : meta.retoId);
    }
    return mapa;
  }, [retos]);

  const puntosPosibles = useMemo(
    () =>
      retos.reduce((s, r) => s + r.puntosBase, 0) +
      CATALOGO_DILEMAS.reduce((s, d) => s + d.puntosBase, 0),
    [retos],
  );

  const progreso = useMemo(
    () => calcularProgreso(proyecto, retos, CATALOGO_DILEMAS, estadoDilemas),
    [proyecto, retos, estadoDilemas],
  );

  const idProyecto = proyecto?.id;

  const accionesDeReto = useCallback(
    (reto: RetoMetadata) => {
      function proyectoId(): ProjectId {
        if (!idProyecto) throw new Error("Tu portafolio local aún no está listo.");
        return idProyecto;
      }
      const definicion = CATALOGO_RETOS.definiciones.find((d) => d.id === reto.missionId);

      return {
        async iniciar() {
          if (!definicion) throw new Error("No se encontró la definición de este reto.");
          setProyecto(
            exigir(await runtime.ciclo.startMission({ projectId: proyectoId(), definition: definicion })),
          );
        },
        async guardarActividad(texto: string) {
          setProyecto(
            exigir(
              await runtime.ciclo.saveTextActivity({
                projectId: proyectoId(),
                missionId: reto.missionId,
                text: texto,
              }),
            ),
          );
        },
        async crearEvidencia(resumen: string) {
          setProyecto(
            exigir(
              await runtime.ciclo.createTextEvidence({
                projectId: proyectoId(),
                missionId: reto.missionId,
                title: reto.tipoEvidencia,
                summary: resumen,
              }),
            ),
          );
        },
        async guardarReflexion(texto: string) {
          setProyecto(
            exigir(
              await runtime.ciclo.saveReflection({
                projectId: proyectoId(),
                missionId: reto.missionId,
                text: texto,
                // Nace privada. Cambiar esa clase es una decisión posterior de la persona.
                privacyClass: "private",
              }),
            ),
          );
        },
        async decidirEvidencia(destino: DestinoEvidencia, justificacion: string) {
          const actual = proyecto?.evidence.find((e) => e.missionId === reto.missionId);
          if (!actual) throw new Error("No hay evidencia que decidir en este reto.");
          const razon = justificacion.trim();
          setProyecto(
            exigir(
              await runtime.ciclo.decideEvidence({
                projectId: proyectoId(),
                evidenceId: actual.id,
                value: destino === "descartar" ? "reject" : "accept",
                ...(razon ? { rationale: razon } : {}),
                missionDisposition: "complete",
                evidenceDisposition: destino === "portafolio" ? "portfolio_eligible" : "record_only",
              }),
            ),
          );
        },
      };
    },
    [idProyecto, proyecto, runtime],
  );

  const resolverDilema = useCallback(
    async (
      dilemaId: string,
      opcionId: "a" | "b" | "c" | "d",
      justificacion: string,
      reparacionAceptada: boolean,
    ) => {
      const dilema = CATALOGO_DILEMAS.find((d) => d.id === dilemaId);
      const opcion = dilema?.opciones.find((o) => o.id === opcionId);
      if (!dilema || !opcion) throw new Error("No se encontró ese dilema.");
      const calidad: Calidad = opcion.calidad;
      setEstadoDilemas(
        runtime.dilemas.registrar({
          dilemaId,
          opcionElegida: opcionId,
          calidad,
          justificacion: justificacion.trim(),
          reparacionAceptada,
          fecha: new Date().toISOString(),
        }),
      );
    },
    [runtime],
  );

  const curar = useCallback(
    async (evidenciaId: Evidence["id"], titulo: string) => {
      if (!idProyecto) throw new Error("Tu portafolio local aún no está listo.");
      setProyecto(
        exigir(await runtime.ciclo.curatePortfolio({ projectId: idProyecto, evidenceId: evidenciaId, title: titulo })),
      );
    },
    [idProyecto, runtime],
  );

  const retirar = useCallback(
    async (itemId: PortfolioItemId) => {
      if (!idProyecto) throw new Error("Tu portafolio local aún no está listo.");
      setProyecto(
        exigir(await runtime.ciclo.removePortfolioItem({ projectId: idProyecto, portfolioItemId: itemId })),
      );
    },
    [idProyecto, runtime],
  );

  const borrarTodo = useCallback(async () => {
    if (idProyecto) await runtime.repositorio.remove(idProyecto);
    setEstadoDilemas(runtime.dilemas.borrar());
    setProyecto(await runtime.cargarOCrear());
  }, [idProyecto, runtime]);

  return {
    cargando,
    errorFatal,
    proyecto,
    estadoDilemas,
    progreso,
    retos,
    titulos,
    puntosPosibles,
    accionesDeReto,
    resolverDilema,
    curar,
    retirar,
    borrarTodo,
  };
}
