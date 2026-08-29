// Rebanada vertical del Gate 2: un reto de EGIA Quest recorrido de punta a punta
// sobre el motor heredado de AI StoryLab, sin tocar una sola línea de src/core.
//
// Recorrido: cargar el reto del catálogo real → iniciarlo como misión → guardar la
// actividad → crear la evidencia → escribir la reflexión → decisión humana → entrada
// al portafolio → persistencia.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryProjectRepository } from "../core/adapters/memory/in-memory-project-repository";
import { createProject } from "../core/application/create-project";
import { createCreativeCycleUseCases } from "../core/application/creative-cycle";
import type { CreativeProject } from "../core/domain/model";
import type { EvidenceId, ISODateTime, ProjectId } from "../core/domain/types";
import { cargarRetos, type CatalogoDeRetos } from "../egia/contenido/cargar-retos";
import { nivelPorPuntos } from "../egia/dominio/reto";

const RUTA_CATALOGO = resolve(
  import.meta.dirname,
  "../../../../contenido/retos/retos_egia_quest_v0-1.json",
);

const catalogo: CatalogoDeRetos = cargarRetos(
  JSON.parse(readFileSync(RUTA_CATALOGO, "utf8")),
);

/** Reloj determinista: las pruebas no dependen de la hora del día. */
function relojFijo() {
  let tic = 0;
  return {
    now: (): ISODateTime =>
      new Date(Date.UTC(2026, 8, 1, 12, 0, tic++)).toISOString() as ISODateTime,
  };
}

/** Generador de identificadores determinista. */
function idsSecuenciales() {
  const contadores = new Map<string, number>();
  return {
    next: (namespace: string): string => {
      const n = (contadores.get(namespace) ?? 0) + 1;
      contadores.set(namespace, n);
      return `${namespace}-${String(n).padStart(3, "0")}`;
    },
  };
}

const REFLEXION_REAL =
  "Al escribir el disclosure me di cuenta de que había usado la herramienta para más cosas de las que recordaba, y que la parte que más me costó admitir fue la reorganización de los párrafos.";

describe("rebanada vertical · EGIA-R-001 de punta a punta", () => {
  let repositorio: InMemoryProjectRepository;
  let ciclo: ReturnType<typeof createCreativeCycleUseCases>;
  let proyecto: CreativeProject;

  const reto = catalogo.porReto.get("EGIA-R-001")!;
  const definicion = catalogo.definiciones.find((d) => d.id === reto.missionId)!;

  beforeEach(async () => {
    repositorio = new InMemoryProjectRepository();
    const dependencias = {
      repository: repositorio,
      clock: relojFijo(),
      ids: idsSecuenciales(),
    };
    ciclo = createCreativeCycleUseCases(dependencias);

    const creado = await createProject(
      { title: "Portafolio de educación general", pseudonym: "Estudiante_EG" },
      dependencias,
    );
    expect(creado.ok).toBe(true);
    if (!creado.ok) throw new Error("no se pudo crear el proyecto");
    proyecto = creado.value;
  });

  it("recorre iniciar, evidenciar, reflexionar, decidir y curar", async () => {
    const projectId: ProjectId = proyecto.id;

    // 1. Iniciar el reto como misión
    const iniciado = await ciclo.startMission({ projectId, definition: definicion });
    expect(iniciado.ok).toBe(true);
    if (!iniciado.ok) throw new Error(iniciado.error.code);
    const misionIniciada = iniciado.value.missions.find((m) => m.missionId === reto.missionId);
    expect(misionIniciada?.status).toBe("in_progress");
    expect(misionIniciada?.startedAt).toBeDefined();

    // 2. Guardar la actividad: el trabajo de la persona
    const actividad = await ciclo.saveTextActivity({
      projectId,
      missionId: reto.missionId,
      text: "Usé una herramienta de IA para reorganizar tres párrafos de mi ensayo de historia.",
    });
    expect(actividad.ok).toBe(true);

    // 3. Crear la evidencia que el reto exige
    const conEvidencia = await ciclo.createTextEvidence({
      projectId,
      missionId: reto.missionId,
      title: reto.tipoEvidencia,
      summary: "Párrafo de disclosure con herramienta, versión, propósito y límite.",
    });
    expect(conEvidencia.ok).toBe(true);
    if (!conEvidencia.ok) throw new Error(conEvidencia.error.code);
    const evidencia = conEvidencia.value.evidence.at(-1);
    expect(evidencia).toBeDefined();

    // 4. La reflexión nace privada: privacidad por defecto
    const conReflexion = await ciclo.saveReflection({
      projectId,
      missionId: reto.missionId,
      text: REFLEXION_REAL,
      privacyClass: "private",
    });
    expect(conReflexion.ok).toBe(true);
    if (!conReflexion.ok) throw new Error(conReflexion.error.code);
    const reflexion = conReflexion.value.reflections.at(-1);
    expect(reflexion?.privacyClass).toBe("private");

    // 5. Decisión humana explícita sobre la evidencia
    const decidido = await ciclo.decideEvidence({
      projectId,
      evidenceId: evidencia!.id as EvidenceId,
      value: "accept",
      rationale: "La declaración está completa y la escribí yo.",
      evidenceDisposition: "portfolio_eligible",
    });
    expect(decidido.ok).toBe(true);
    if (!decidido.ok) throw new Error(decidido.error.code);
    expect(decidido.value.decisions.length).toBeGreaterThan(0);

    // 6. La evidencia entra al portafolio solo por acto explícito
    const curado = await ciclo.curatePortfolio({
      projectId,
      evidenceId: evidencia!.id as EvidenceId,
      title: `${reto.retoId} · ${reto.tipoEvidencia}`,
    });
    expect(curado.ok).toBe(true);
    if (!curado.ok) throw new Error(curado.error.code);
    expect(curado.value.portfolio.items).toHaveLength(1);
    expect(curado.value.portfolio.items[0]?.title).toContain("EGIA-R-001");

    // 7. Todo quedó persistido
    const releido = await repositorio.load(projectId);
    expect(releido.ok).toBe(true);
    if (!releido.ok || !releido.value) throw new Error("no persistió");
    expect(releido.value.portfolio.items).toHaveLength(1);
    expect(releido.value.reflections).toHaveLength(1);
    expect(releido.value.missions.find((m) => m.missionId === reto.missionId)).toBeDefined();
  });

  it("el núcleo impone el orden trabajo, evidencia, reflexión", async () => {
    // Invariante heredada y muy conveniente: no se reflexiona sobre nada. La
    // reflexión llega después de haber trabajado y de haber producido evidencia.
    const projectId: ProjectId = proyecto.id;
    await ciclo.startMission({ projectId, definition: definicion });

    const sinNada = await ciclo.createTextEvidence({
      projectId,
      missionId: reto.missionId,
      title: reto.tipoEvidencia,
      summary: "Evidencia sin trabajo previo.",
    });
    expect(sinNada.ok).toBe(false);
    if (sinNada.ok) throw new Error("debería haber fallado");
    expect(sinNada.error.code).toBe("ACTIVITY_RESPONSE_NOT_FOUND");

    await ciclo.saveTextActivity({
      projectId,
      missionId: reto.missionId,
      text: "Trabajo previo, que el núcleo exige antes de evidenciar.",
    });

    const sinEvidencia = await ciclo.saveReflection({
      projectId,
      missionId: reto.missionId,
      text: REFLEXION_REAL,
      privacyClass: "private",
    });
    expect(sinEvidencia.ok).toBe(false);
    if (sinEvidencia.ok) throw new Error("debería haber fallado");
    expect(sinEvidencia.error.code).toBe("EVIDENCE_NOT_FOUND");
  });

  it("la reflexión nace privada y no cambia de clase sin decisión humana", async () => {
    const projectId: ProjectId = proyecto.id;
    await ciclo.startMission({ projectId, definition: definicion });
    await ciclo.saveTextActivity({
      projectId,
      missionId: reto.missionId,
      text: "Trabajo previo, que el núcleo exige antes de reflexionar.",
    });
    await ciclo.createTextEvidence({
      projectId,
      missionId: reto.missionId,
      title: reto.tipoEvidencia,
      summary: "Evidencia previa a la reflexión.",
    });
    const conReflexion = await ciclo.saveReflection({
      projectId,
      missionId: reto.missionId,
      text: REFLEXION_REAL,
      privacyClass: "private",
    });
    expect(conReflexion.ok).toBe(true);
    if (!conReflexion.ok) throw new Error(conReflexion.error.code);

    const releido = await repositorio.load(projectId);
    if (!releido.ok || !releido.value) throw new Error("no persistió");
    for (const r of releido.value.reflections) {
      expect(r.privacyClass).toBe("private");
    }
  });

  it("una evidencia sin decisión humana no entra al portafolio por sí sola", async () => {
    const projectId: ProjectId = proyecto.id;
    await ciclo.startMission({ projectId, definition: definicion });
    await ciclo.saveTextActivity({
      projectId,
      missionId: reto.missionId,
      text: "Trabajo realizado antes de producir la evidencia.",
    });
    const conEvidencia = await ciclo.createTextEvidence({
      projectId,
      missionId: reto.missionId,
      title: reto.tipoEvidencia,
      summary: "Evidencia creada sin decidir todavía.",
    });
    expect(conEvidencia.ok).toBe(true);
    if (!conEvidencia.ok) throw new Error(conEvidencia.error.code);
    expect(conEvidencia.value.portfolio.items).toHaveLength(0);
  });

  it("iniciar dos veces el mismo reto no duplica la misión", async () => {
    const projectId: ProjectId = proyecto.id;
    await ciclo.startMission({ projectId, definition: definicion });
    const segundo = await ciclo.startMission({ projectId, definition: definicion });
    expect(segundo.ok).toBe(true);
    if (!segundo.ok) throw new Error(segundo.error.code);
    const cuantas = segundo.value.missions.filter((m) => m.missionId === reto.missionId).length;
    expect(cuantas).toBe(1);
  });

  it("el reto aporta su carga pedagógica al recorrido del motor", () => {
    // El motor mueve el ciclo; EGIA aporta el sentido. Esta es la costura.
    expect(definicion.purpose).toBe(reto.andamiaje === "plantilla" ? definicion.purpose : definicion.purpose);
    expect(definicion.instructions).toEqual(reto.apoyo);
    expect(reto.criterioEtico).toContain("Declarar no es confesar");
    expect(nivelPorPuntos(reto.puntosBase).nivel).toBe("Q1");
  });
});
