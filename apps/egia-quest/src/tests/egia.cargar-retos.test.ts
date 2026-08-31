import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  ErrorDeContenido,
  cargarRetos,
  missionIdDeReto,
} from "../egia/contenido/cargar-retos";
import {
  ANDAMIAJE_POR_NIVEL,
  VERBO_POR_NIVEL,
  nivelPorPuntos,
  prerrequisitosCumplidos,
} from "../egia/dominio/reto";

const RUTA_CATALOGO = resolve(
  import.meta.dirname,
  "../../../../contenido/retos/retos_egia_quest_v0-1.json",
);

const catalogoCrudo: unknown = JSON.parse(readFileSync(RUTA_CATALOGO, "utf8"));

function retoBase() {
  return {
    id: "EGIA-R-900",
    titulo: "Reto de prueba",
    practica_guia: null,
    nivel: "Q0",
    verbo: "reconocer",
    desempeno_esperado: 1,
    competencias: ["literacidad_ia"],
    consigna: "Consigna de prueba con longitud suficiente para el cargador.",
    evidencia_minima: "Una evidencia de prueba.",
    tipo_evidencia: "Bitácora de proceso",
    sensibilidad: "media",
    reflexion: "¿Qué aprendiste?",
    criterio_etico: "Criterio de prueba.",
    accesibilidad: "Accesibilidad de prueba.",
    cuando_no_usar_ia: "No uses IA para esta prueba.",
    andamiaje: "plantilla",
    plantilla: ["Campo uno", "Campo dos", "Campo tres"],
    prerrequisitos: [],
    puntos_base: 10,
    badge_posible: null,
  };
}

describe("cargarRetos · catálogo real de Fase 1", () => {
  const catalogo = cargarRetos(catalogoCrudo);

  it("carga los quince retos como definiciones de misión", () => {
    expect(catalogo.definiciones).toHaveLength(15);
    expect(catalogo.metadatos.size).toBe(15);
    expect(catalogo.porReto.size).toBe(15);
  });

  it("deriva un MissionId estable y trazable desde el id del reto", () => {
    expect(missionIdDeReto("EGIA-R-001")).toBe("reto-egia-r-001");
    const primera = catalogo.definiciones[0]!;
    expect(primera.id).toBe(missionIdDeReto("EGIA-R-001"));
    expect(primera.title).toContain("EGIA-R-001");
  });

  it("cada definición cumple el contrato del núcleo copiado", () => {
    for (const d of catalogo.definiciones) {
      expect(d.activityKind).toBe("text");
      expect(d.evidenceKind).toBe("text");
      expect(d.optional).toBe(false);
      expect(d.purpose.length).toBeGreaterThan(0);
      expect(d.instructions.length).toBeGreaterThan(0);
    }
  });

  it("conserva la carga pedagógica que el núcleo no modela", () => {
    const r1 = catalogo.porReto.get("EGIA-R-001")!;
    expect(r1.nivel).toBe("Q0");
    expect(r1.verbo).toBe("reconocer");
    expect(r1.competencias).toContain("literacidad_ia");
    expect(r1.cuandoNoUsarIa).toContain("disclosure");
    expect(r1.badgePosible).toBe("badge_declaracion_limpia");
  });

  it("todo reto declara «cuándo no usar IA»", () => {
    for (const meta of catalogo.porReto.values()) {
      expect(meta.cuandoNoUsarIa.length).toBeGreaterThan(20);
    }
  });

  it("verbo y andamiaje son coherentes con el nivel en los quince", () => {
    for (const meta of catalogo.porReto.values()) {
      expect(meta.verbo).toBe(VERBO_POR_NIVEL[meta.nivel]);
      expect(meta.andamiaje).toBe(ANDAMIAJE_POR_NIVEL[meta.nivel]);
    }
  });

  it("los retos de Q5 y Q6 no traen apoyo, solo criterio", () => {
    for (const meta of catalogo.porReto.values()) {
      if (meta.nivel === "Q5" || meta.nivel === "Q6") {
        expect(meta.andamiaje).toBe("criterio");
        expect(meta.apoyo).toHaveLength(0);
      }
    }
  });
});

describe("cargarRetos · invariantes", () => {
  it("rechaza un verbo que no corresponde al nivel", () => {
    const malo = { ...retoBase(), verbo: "transferir" };
    expect(() => cargarRetos({ retos: [malo] })).toThrow(ErrorDeContenido);
    expect(() => cargarRetos({ retos: [malo] })).toThrow(/verbo/i);
  });

  it("rechaza un andamiaje que no corresponde al nivel", () => {
    const malo = { ...retoBase(), andamiaje: "criterio" };
    expect(() => cargarRetos({ retos: [malo] })).toThrow(/andamiaje/i);
  });

  it("rechaza una competencia fuera de las diez familias canónicas", () => {
    const malo = { ...retoBase(), competencias: ["pensamiento_magico"] };
    expect(() => cargarRetos({ retos: [malo] })).toThrow(/familias canónicas/i);
  });

  it("rechaza un reto sin «cuándo no usar IA»", () => {
    const malo = { ...retoBase(), cuando_no_usar_ia: "" };
    expect(() => cargarRetos({ retos: [malo] })).toThrow(/cuando_no_usar_ia/);
  });

  it("rechaza identificadores repetidos", () => {
    expect(() => cargarRetos({ retos: [retoBase(), retoBase()] })).toThrow(/repetido/i);
  });

  it("rechaza un prerrequisito inexistente", () => {
    const malo = { ...retoBase(), prerrequisitos: ["EGIA-R-999"] };
    expect(() => cargarRetos({ retos: [malo] })).toThrow(/no existe/i);
  });

  it("rechaza un prerrequisito de nivel superior", () => {
    const alto = {
      ...retoBase(),
      id: "EGIA-R-901",
      nivel: "Q6",
      verbo: "transferir",
      andamiaje: "criterio",
      plantilla: undefined,
    };
    const bajo = { ...retoBase(), prerrequisitos: ["EGIA-R-901"] };
    expect(() => cargarRetos({ retos: [alto, bajo] })).toThrow(/nivel superior/i);
  });

  it("rechaza un catálogo sin lista de retos", () => {
    expect(() => cargarRetos({})).toThrow(/lista de retos/i);
    expect(() => cargarRetos(null)).toThrow(ErrorDeContenido);
  });
});

describe("progresión", () => {
  it("sitúa el nivel según los puntos acumulados", () => {
    expect(nivelPorPuntos(0).nivel).toBe("Q0");
    expect(nivelPorPuntos(9).nivel).toBe("Q0");
    expect(nivelPorPuntos(10).nivel).toBe("Q1");
    expect(nivelPorPuntos(74).nivel).toBe("Q3");
    expect(nivelPorPuntos(140).nivel).toBe("Q6");
    expect(nivelPorPuntos(5000).nivel).toBe("Q6");
    expect(nivelPorPuntos(10).etiqueta).toBe("Práctica situada");
  });

  it("no cae por debajo de Q0 con puntos negativos", () => {
    expect(nivelPorPuntos(-50).nivel).toBe("Q0");
  });

  it("exige los prerrequisitos declarados antes de abrir un reto", () => {
    const catalogo = cargarRetos(catalogoCrudo);
    const r3 = catalogo.porReto.get("EGIA-R-003")!;
    expect(prerrequisitosCumplidos(r3, [])).toBe(false);
    expect(prerrequisitosCumplidos(r3, ["EGIA-R-002"])).toBe(true);

    const r1 = catalogo.porReto.get("EGIA-R-001")!;
    expect(prerrequisitosCumplidos(r1, [])).toBe(true);
  });

  it("documenta DEUDA-EGIA-011: el catálogo entero desborda el último umbral", () => {
    const catalogo = cargarRetos(catalogoCrudo);
    const total = [...catalogo.porReto.values()].reduce((s, m) => s + m.puntosBase, 0);
    expect(total).toBe(270);
    // Con 270 puntos disponibles y Q6 en 140, se llega al último nivel a mitad del
    // recorrido. Los umbrales se recalibran en F3, cuando exista el tablero.
    expect(nivelPorPuntos(total).nivel).toBe("Q6");
  });
});
