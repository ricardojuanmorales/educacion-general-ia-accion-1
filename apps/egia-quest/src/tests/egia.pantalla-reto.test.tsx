// @vitest-environment jsdom

// Pruebas de presentación de la rebanada vertical. Cierran el Gate 2, que exige
// dominio, aplicación y presentación.
//
// Dos de estas pruebas existen porque el monolito v0.1A falló exactamente ahí y
// costó dos diagnósticos: el botón desactivado que se veía igual que el activo, y
// el aviso de validación renderizado a 500 px de donde estaba la persona.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InMemoryProjectRepository } from "../core/adapters/memory/in-memory-project-repository";
import { createProject } from "../core/application/create-project";
import { createCreativeCycleUseCases } from "../core/application/creative-cycle";
import type { CreativeProject } from "../core/domain/model";
import type { ISODateTime } from "../core/domain/types";
import { cargarRetos } from "../egia/contenido/cargar-retos";
import { PantallaReto, pasoActual, type AccionesReto } from "../egia/presentacion/PantallaReto";

const RUTA_CATALOGO = resolve(
  import.meta.dirname,
  "../../../../contenido/retos/retos_egia_quest_v0-1.json",
);
const catalogo = cargarRetos(JSON.parse(readFileSync(RUTA_CATALOGO, "utf8")));
const reto = catalogo.porReto.get("EGIA-R-001")!;
const definicion = catalogo.definiciones.find((d) => d.id === reto.missionId)!;

function definicionDe(retoId: string) {
  const meta = catalogo.porReto.get(retoId)!;
  return catalogo.definiciones.find((d) => d.id === meta.missionId)!;
}

afterEach(() => {
  cleanup();
});

function accionesFalsas(): AccionesReto {
  return {
    iniciar: vi.fn(async () => {}),
    guardarActividad: vi.fn(async () => {}),
    crearEvidencia: vi.fn(async () => {}),
    guardarReflexion: vi.fn(async () => {}),
    decidirEvidencia: vi.fn(async () => {}),
  };
}

describe("PantallaReto · el reto antes de iniciarse", () => {
  it("muestra la consigna, el criterio ético y el «cuándo no usar IA» desde el principio", () => {
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={null}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    expect(screen.getByText(definicion.purpose)).toBeDefined();
    expect(screen.getByText(reto.criterioEtico)).toBeDefined();
    const campo = screen.getByText(reto.cuandoNoUsarIa);
    expect(campo.getAttribute("data-campo")).toBe("cuando-no-usar");
  });

  it("un reto con prerrequisitos sin cumplir no se puede iniciar", () => {
    const r3 = catalogo.porReto.get("EGIA-R-003")!;
    render(
      <PantallaReto
        reto={r3}
        definicion={definicionDe(r3.retoId)}
        proyecto={null}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    const boton = screen.getByRole("button", { name: "Iniciar" });
    expect(boton.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("note").textContent).toContain("EGIA-R-002");
  });

  it("con los prerrequisitos cumplidos, el botón se habilita", () => {
    const r3 = catalogo.porReto.get("EGIA-R-003")!;
    render(
      <PantallaReto
        reto={r3}
        definicion={definicionDe(r3.retoId)}
        proyecto={null}
        acciones={accionesFalsas()}
        retosCompletados={["EGIA-R-002"]}
      />,
    );
    expect(screen.getByRole("button", { name: "Iniciar" }).hasAttribute("disabled")).toBe(false);
  });

  it("DEUDA-EGIA-001 · un botón desactivado se declara desactivado ante la tecnología de apoyo", () => {
    const r3 = catalogo.porReto.get("EGIA-R-003")!;
    render(
      <PantallaReto
        reto={r3}
        definicion={definicionDe(r3.retoId)}
        proyecto={null}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    // getByRole con hidden:false no lo devolvería como pulsable; el atributo es lo que
    // lee un lector de pantalla, y es lo que faltaba en el monolito junto con el estilo.
    const boton = screen.getByRole("button", { name: "Iniciar" });
    expect(boton).toHaveProperty("disabled", true);
  });
});

describe("PantallaReto · validación junto al control", () => {
  it("DEUDA-EGIA-001 · el aviso de reflexión corta aparece dentro de la tarjeta", async () => {
    const usuario = userEvent.setup();
    const proyecto = proyectoConPasos("reflexion");
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={proyecto}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );

    await usuario.type(screen.getByRole("textbox"), "corto");
    await usuario.click(screen.getByRole("button", { name: "Guardar reflexión" }));

    const tarjeta = screen.getByRole("article");
    const aviso = within(tarjeta).getByRole("alert");
    expect(aviso.textContent).toContain("caracteres más");
    // La prueba que el monolito no tenía: el aviso está DENTRO de la tarjeta del reto.
    expect(tarjeta.contains(aviso)).toBe(true);
  });

  it("con la reflexión vacía el mensaje explica por qué, no solo que falta", async () => {
    const usuario = userEvent.setup();
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={proyectoConPasos("reflexion")}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    await usuario.click(screen.getByRole("button", { name: "Guardar reflexión" }));
    expect(screen.getByRole("alert").textContent).toContain("no un trámite");
  });

  it("el aviso desaparece cuando la reflexión alcanza el mínimo", async () => {
    const usuario = userEvent.setup();
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={proyectoConPasos("reflexion")}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    await usuario.click(screen.getByRole("button", { name: "Guardar reflexión" }));
    expect(screen.queryByRole("alert")).not.toBeNull();
    await usuario.type(
      screen.getByRole("textbox"),
      "Revisé la salida con calma y cambié dos decisiones.",
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("una reflexión suficiente sí llama al motor", async () => {
    const usuario = userEvent.setup();
    const acciones = accionesFalsas();
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={proyectoConPasos("reflexion")}
        acciones={acciones}
        retosCompletados={[]}
      />,
    );
    const texto = "Al escribir el disclosure noté que había delegado más de lo que recordaba.";
    await usuario.type(screen.getByRole("textbox"), texto);
    await usuario.click(screen.getByRole("button", { name: "Guardar reflexión" }));
    expect(acciones.guardarReflexion).toHaveBeenCalledWith(texto);
  });
});

describe("PantallaReto · el orden heredado se ve en pantalla", () => {
  it("muestra el paso que corresponde en cada momento", () => {
    expect(pasoActual(reto, null)).toBe("sin_iniciar");
    expect(pasoActual(reto, proyectoConPasos("actividad"))).toBe("actividad");
    expect(pasoActual(reto, proyectoConPasos("evidencia"))).toBe("evidencia");
    expect(pasoActual(reto, proyectoConPasos("reflexion"))).toBe("reflexion");
    expect(pasoActual(reto, proyectoConPasos("decision"))).toBe("decision");
  });

  it("DEC-EGIA-042 · con evidencia y reflexión el reto NO está completado: falta la decisión", () => {
    // Esta prueba existe porque la interfaz decía «completado» donde el motor decía
    // `ready_for_review`. Una pantalla que miente sobre el estado del motor es un bug,
    // aunque se vea bien.
    const conReflexion = proyectoConPasos("decision");
    expect(pasoActual(reto, conReflexion)).not.toBe("completado");
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={conReflexion}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    expect(screen.getByText(/paso 4 de 4/)).toBeDefined();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("la decisión ofrece las tres salidas y registra la elegida con su razón", async () => {
    const usuario = userEvent.setup();
    const acciones = accionesFalsas();
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={proyectoConPasos("decision")}
        acciones={acciones}
        retosCompletados={[]}
      />,
    );

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    await usuario.click(screen.getByRole("radio", { name: /solo como registro privado/ }));
    await usuario.type(screen.getByRole("textbox"), "Prefiero no exponerlo todavía.");
    await usuario.click(
      screen.getByRole("button", { name: "Registrar mi decisión y cerrar el reto" }),
    );

    expect(acciones.decidirEvidencia).toHaveBeenCalledWith(
      "registro",
      "Prefiero no exponerlo todavía.",
    );
  });

  it("numera los pasos para que la persona sepa dónde está", () => {
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={proyectoConPasos("evidencia")}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    expect(screen.getByText(/paso 2 de 4/)).toBeDefined();
  });

  it("dice que la reflexión es privada antes de que se escriba", () => {
    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={proyectoConPasos("reflexion")}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    expect(screen.getByText(/se guarda como privada/)).toBeDefined();
  });
});

describe("PantallaReto · recorrido real contra el motor", () => {
  let proyecto: CreativeProject;
  let ciclo: ReturnType<typeof createCreativeCycleUseCases>;

  beforeEach(async () => {
    let t = 0;
    const deps = {
      repository: new InMemoryProjectRepository(),
      clock: { now: () => new Date(Date.UTC(2026, 8, 1, 12, 0, t++)).toISOString() as ISODateTime },
      ids: { next: (ns: string) => `${ns}-${++t}` },
    };
    ciclo = createCreativeCycleUseCases(deps);
    const creado = await createProject({ title: "P", pseudonym: "Estudiante" }, deps);
    if (!creado.ok) throw new Error("no se creó");
    proyecto = creado.value;
  });

  it("la pantalla avanza de paso conforme el motor guarda", async () => {
    const projectId = proyecto.id;

    const iniciado = await ciclo.startMission({ projectId, definition: definicion });
    if (!iniciado.ok) throw new Error(iniciado.error.code);
    expect(pasoActual(reto, iniciado.value)).toBe("actividad");

    const conActividad = await ciclo.saveTextActivity({
      projectId,
      missionId: reto.missionId,
      text: "Reorganicé tres párrafos con ayuda de una herramienta.",
    });
    if (!conActividad.ok) throw new Error(conActividad.error.code);
    expect(pasoActual(reto, conActividad.value)).toBe("evidencia");

    const conEvidencia = await ciclo.createTextEvidence({
      projectId,
      missionId: reto.missionId,
      title: reto.tipoEvidencia,
      summary: "Párrafo de disclosure completo.",
    });
    if (!conEvidencia.ok) throw new Error(conEvidencia.error.code);
    expect(pasoActual(reto, conEvidencia.value)).toBe("reflexion");

    const conReflexion = await ciclo.saveReflection({
      projectId,
      missionId: reto.missionId,
      text: "Noté que había delegado más de lo que recordaba, y por qué me costó admitirlo.",
      privacyClass: "private",
    });
    if (!conReflexion.ok) throw new Error(conReflexion.error.code);
    // DEC-EGIA-042: aquí el monolito habría dicho «completado». El motor no.
    expect(pasoActual(reto, conReflexion.value)).toBe("decision");

    const evidencia = conReflexion.value.evidence[0];
    if (!evidencia) throw new Error("sin evidencia");

    const conDecision = await ciclo.decideEvidence({
      projectId,
      evidenceId: evidencia.id,
      value: "accept",
      rationale: "Representa lo que hice y quiero poder curarlo.",
      missionDisposition: "complete",
      evidenceDisposition: "portfolio_eligible",
    });
    if (!conDecision.ok) throw new Error(conDecision.error.code);
    expect(pasoActual(reto, conDecision.value)).toBe("completado");

    render(
      <PantallaReto
        reto={reto}
        definicion={definicion}
        proyecto={conDecision.value}
        acciones={accionesFalsas()}
        retosCompletados={[]}
      />,
    );
    expect(screen.getByRole("status").textContent).toContain("Reto completado");
  });

  it("aceptar como registro cierra el reto pero no abre el portafolio", async () => {
    const projectId = proyecto.id;
    await ciclo.startMission({ projectId, definition: definicion });
    await ciclo.saveTextActivity({ projectId, missionId: reto.missionId, text: "trabajo hecho" });
    const conEvidencia = await ciclo.createTextEvidence({
      projectId,
      missionId: reto.missionId,
      title: reto.tipoEvidencia,
      summary: "Resumen de la evidencia.",
    });
    if (!conEvidencia.ok) throw new Error(conEvidencia.error.code);
    await ciclo.saveReflection({
      projectId,
      missionId: reto.missionId,
      text: "Una reflexión suficientemente larga para el mínimo.",
      privacyClass: "private",
    });

    const evidencia = conEvidencia.value.evidence[0];
    if (!evidencia) throw new Error("sin evidencia");

    const registrada = await ciclo.decideEvidence({
      projectId,
      evidenceId: evidencia.id,
      value: "accept",
      missionDisposition: "complete",
      evidenceDisposition: "record_only",
    });
    if (!registrada.ok) throw new Error(registrada.error.code);

    expect(pasoActual(reto, registrada.value)).toBe("completado");
    expect(registrada.value.evidence[0]?.status).toBe("reviewed");

    // Y aquí una limitación que conviene tener escrita, no descubrirla en el piloto:
    // `record_only` deja la evidencia como «reviewed», pero para el motor sigue habiendo una
    // decisión humana de aceptación, así que la curaduría NO se rechaza. La promesa «no será
    // elegible para el portafolio» la sostiene hoy la pantalla, que filtra por estado, y no el
    // dominio. Queda registrada como DEUDA-EGIA-023.
    const curada = await ciclo.curatePortfolio({
      projectId,
      evidenceId: evidencia.id,
      title: "Entra, aunque la interfaz no lo ofrezca",
    });
    expect(curada.ok).toBe(true);
  });
});

/** Construye un proyecto mínimo situado en el paso pedido, sin pasar por el motor. */
function proyectoConPasos(
  hasta: "actividad" | "evidencia" | "reflexion" | "decision",
): CreativeProject {
  const base = {
    schemaVersion: "0.8.0-alpha.2",
    id: "proyecto-prueba",
    title: "Prueba",
    status: "active",
    profile: {
      pseudonym: "Estudiante",
      accessibility: { reducedMotion: false, highContrast: false, textScale: "default" },
    },
    missions: [
      { missionId: reto.missionId, status: "in_progress", startedAt: "2026-09-01T12:00:00.000Z" },
    ] as unknown[],
    activityResponses: [] as unknown[],
    evidence: [] as unknown[],
    reflections: [] as unknown[],
    decisions: [],
    portfolio: { items: [] },
    featureFlags: {
      facilitatorView: false,
      groupDashboard: false,
      embeddedAI: false,
      cloudSync: false,
    },
    createdAt: "2026-09-01T12:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  };

  if (hasta !== "actividad") {
    base.activityResponses = [{ id: "a1", missionId: reto.missionId, text: "trabajo" }];
  }
  if (hasta === "reflexion" || hasta === "decision") {
    base.evidence = [
      { id: "e1", missionId: reto.missionId, title: "Declaración", summary: "s", status: "draft" },
    ];
    base.missions = [
      { missionId: reto.missionId, status: "ready_for_review", startedAt: "2026-09-01T12:00:00.000Z" },
    ];
  }
  if (hasta === "decision") {
    base.reflections = [{ id: "r1", missionId: reto.missionId, text: "reflexión", privacyClass: "private" }];
  }

  return base as unknown as CreativeProject;
}
