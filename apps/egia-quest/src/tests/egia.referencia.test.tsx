// @vitest-environment jsdom

// Pruebas del glosario y las fichas de herramienta.
//
// Las dos secciones son de consulta: no producen evidencia, no dan puntos y no guardan estado.
// Lo que sí tienen que sostener son las decisiones de contenido, y eso es lo que se prueba aquí:
// que la distinción esté, que las remisiones resuelvan, que el límite de cada herramienta se
// muestre con el mismo peso que su capacidad, y que ninguna ficha nombre un producto.

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import {
  DECISION_HERRAMIENTAS,
  GLOSARIO,
  HERRAMIENTAS,
  METODO_GLOSARIO,
} from "../egia/contenido/catalogo";
import { cargarGlosario, cargarHerramientas } from "../egia/contenido/cargar-referencia";
import { ErrorDeContenido } from "../egia/contenido/cargar-retos";
import { filtrarTerminos, normalizar, porInicial } from "../egia/dominio/referencia";
import { Glosario } from "../egia/presentacion/Glosario";
import { Herramientas } from "../egia/presentacion/Herramientas";

afterEach(() => {
  cleanup();
});

describe("Glosario · el contenido aprobado", () => {
  it("carga los 38 términos y todos traen su distinción", () => {
    expect(GLOSARIO).toHaveLength(38);
    for (const t of GLOSARIO) {
      expect(t.distincion.trim().length).toBeGreaterThan(0);
      expect(t.definicionOperativa.trim().length).toBeGreaterThan(0);
    }
  });

  it("toda remisión cruzada resuelve a un término que existe", () => {
    const nombres = new Set(GLOSARIO.map((t) => t.termino));
    for (const t of GLOSARIO) {
      for (const r of t.relacionados) {
        expect(nombres.has(r), `«${t.termino}» remite a «${r}», que no existe`).toBe(true);
      }
    }
  });

  it("el cargador rechaza una remisión rota en vez de mostrarla muerta", () => {
    // Nueve remisiones rotas en la primera redacción del glosario es la razón de que
    // esta comprobación exista en tiempo de ejecución y no solo en el validador.
    expect(() =>
      cargarGlosario({
        terminos: [
          {
            termino: "Sesgo",
            definicion_breve: "b",
            definicion_operativa: "o",
            distincion: "d",
            relacionados: ["Término que no existe"],
            fuente: "f",
          },
        ],
      }),
    ).toThrow(ErrorDeContenido);
  });

  it("el cargador exige la distinción: sin ella el término es decorativo", () => {
    expect(() =>
      cargarGlosario({
        terminos: [
          { termino: "Sesgo", definicion_breve: "b", definicion_operativa: "o", fuente: "f" },
        ],
      }),
    ).toThrow(/distincion/);
  });
});

describe("Glosario · búsqueda y navegación", () => {
  it("busca sin acentos y sin distinguir mayúsculas", () => {
    expect(normalizar("Declaración")).toBe("declaracion");
    const hallados = filtrarTerminos(GLOSARIO, "abstencion");
    expect(hallados.length).toBeGreaterThan(0);
    expect(hallados.some((t) => t.termino === "Abstención justificada")).toBe(true);
  });

  it("agrupa por inicial en orden alfabético español", () => {
    const grupos = porInicial(GLOSARIO);
    const iniciales = grupos.map((g) => g.inicial);
    expect(iniciales).toEqual([...iniciales].sort((a, b) => a.localeCompare(b, "es")));
  });

  it("muestra el método del glosario y el recuento de términos", () => {
    render(<Glosario terminos={GLOSARIO} metodo={METODO_GLOSARIO} />);
    expect(screen.getByText(METODO_GLOSARIO)).toBeDefined();
    expect(screen.getByRole("status").textContent).toContain("38 términos");
  });

  it("filtrar reduce la lista y lo dice en voz alta", async () => {
    const usuario = userEvent.setup();
    render(<Glosario terminos={GLOSARIO} metodo={METODO_GLOSARIO} />);
    await usuario.type(screen.getByRole("searchbox"), "abstencion");
    expect(screen.getByRole("status").textContent).toMatch(/de 38 términos/);
    expect(document.querySelectorAll("[data-termino]").length).toBeLessThan(38);
  });

  it("una búsqueda sin resultados explica qué hacer, no solo que no hay nada", async () => {
    const usuario = userEvent.setup();
    render(<Glosario terminos={GLOSARIO} metodo={METODO_GLOSARIO} />);
    await usuario.type(screen.getByRole("searchbox"), "zzzzz");
    expect(screen.getByText(/prueba con una palabra de la definición/)).toBeDefined();
  });

  it("una remisión mueve el FOCO al término remitido, no solo la vista", async () => {
    // Sin esto, quien navega con teclado se queda en la remisión que pulsó mientras la
    // página se mueve sin avisar: el destino queda anunciado para el ojo y perdido para
    // todo lo demás. jsdom no implementa scrollIntoView, así que lo que se prueba aquí
    // es justamente lo que el scroll no resuelve.
    const usuario = userEvent.setup();
    const conRemision = GLOSARIO.find((t) => t.relacionados.length > 0)!;
    const destino = conRemision.relacionados[0]!;

    render(<Glosario terminos={GLOSARIO} metodo={METODO_GLOSARIO} />);
    const tarjeta = document.querySelector(`[data-termino="${conRemision.termino}"]`)! as HTMLElement;
    await usuario.click(within(tarjeta).getByText("Ver definición operativa y distinción"));
    await usuario.click(within(tarjeta).getByRole("button", { name: destino }));

    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const tarjetaDestino = document.querySelector(`[data-termino="${destino}"]`)!;
    expect(tarjetaDestino.contains(document.activeElement)).toBe(true);
  });

  it("una remisión lleva al término remitido y lo deja abierto", async () => {
    const usuario = userEvent.setup();
    const conRemision = GLOSARIO.find((t) => t.relacionados.length > 0)!;
    const destino = conRemision.relacionados[0]!;

    render(<Glosario terminos={GLOSARIO} metodo={METODO_GLOSARIO} />);

    const tarjeta = document.querySelector(`[data-termino="${conRemision.termino}"]`)!;
    await usuario.click(within(tarjeta as HTMLElement).getByText("Ver definición operativa y distinción"));
    await usuario.click(within(tarjeta as HTMLElement).getByRole("button", { name: destino }));

    const tarjetaDestino = document.querySelector(`[data-termino="${destino}"]`);
    expect(tarjetaDestino?.getAttribute("data-abierto")).toBe("true");
  });

  it("DEUDA-EGIA-019 · el término con nota pendiente la muestra en su propia entrada", async () => {
    const usuario = userEvent.setup();
    const pendiente = GLOSARIO.find((t) => t.notaPendiente !== null);
    expect(pendiente?.termino).toBe("IBATA");

    render(<Glosario terminos={GLOSARIO} metodo={METODO_GLOSARIO} />);
    const tarjeta = document.querySelector('[data-termino="IBATA"]')! as HTMLElement;
    await usuario.click(within(tarjeta).getByText("Ver definición operativa y distinción"));
    expect(within(tarjeta).getByRole("note").textContent).toContain("Pendiente");
  });
});

describe("Fichas de herramienta · tipos, no productos", () => {
  it("carga las ocho fichas con la rejilla completa", () => {
    expect(HERRAMIENTAS).toHaveLength(8);
    for (const f of HERRAMIENTAS) {
      expect(f.queHace.trim().length).toBeGreaterThan(0);
      expect(f.queNoHace.trim().length).toBeGreaterThan(0);
      expect(f.datosQueToca.trim().length).toBeGreaterThan(0);
      expect(f.cuandoNoUsar.trim().length).toBeGreaterThan(0);
      expect(f.riesgosTipicos.length).toBeGreaterThan(0);
      expect(f.senalesDeAlerta.length).toBeGreaterThan(0);
      expect(f.preguntasAntesDeUsar.length).toBeGreaterThan(0);
    }
  });

  it("ninguna ficha nombra un producto concreto", () => {
    // La decisión de contenido dice tipos, no marcas: una ficha con nombres y versiones
    // caduca en meses. Esta prueba la sostiene en vez de confiar en que nadie la olvide.
    const marcas = /chatgpt|claude|gemini|copilot|midjourney|dall-?e|openai|anthropic|whisper|grammarly|turnitin/i;
    for (const f of HERRAMIENTAS) {
      const texto = [f.tipo, f.queHace, f.queNoHace, f.datosQueToca, f.cuandoNoUsar].join(" ");
      expect(marcas.test(texto), `«${f.tipo}» menciona un producto concreto`).toBe(false);
    }
  });

  it("el cargador rechaza un identificador fuera de la serie EGIA-H-NNN", () => {
    expect(() => cargarHerramientas({ herramientas: [{ id: "H-1" }] })).toThrow(ErrorDeContenido);
  });

  it("cada ficha muestra el límite con el mismo peso que la capacidad", () => {
    render(<Herramientas fichas={HERRAMIENTAS} decisionDeDiseno={DECISION_HERRAMIENTAS} />);
    for (const f of HERRAMIENTAS) {
      const ficha = document.querySelector(`[data-herramienta="${f.id}"]`)! as HTMLElement;
      // Los dos lados existen y son hermanos dentro del mismo bloque comparativo.
      const hace = ficha.querySelector(".par__lado--hace");
      const noHace = ficha.querySelector(".par__lado--no-hace");
      expect(hace, `${f.id} sin «qué hace»`).not.toBeNull();
      expect(noHace, `${f.id} sin «qué no hace»`).not.toBeNull();
      expect(hace?.parentElement).toBe(noHace?.parentElement);
      expect(within(ficha).getByText(f.cuandoNoUsar)).toBeDefined();
    }
  });

  it("explica por qué son tipos y no marcas, sin que haya que preguntarlo fuera", () => {
    render(<Herramientas fichas={HERRAMIENTAS} decisionDeDiseno={DECISION_HERRAMIENTAS} />);
    expect(screen.getByText("Por qué tipos y no marcas")).toBeDefined();
    expect(screen.getByText(DECISION_HERRAMIENTAS)).toBeDefined();
  });

  it("la búsqueda filtra por lo que la herramienta hace", async () => {
    const usuario = userEvent.setup();
    render(<Herramientas fichas={HERRAMIENTAS} decisionDeDiseno={DECISION_HERRAMIENTAS} />);
    await usuario.type(screen.getByRole("searchbox"), "voz");
    const visibles = document.querySelectorAll("[data-herramienta]");
    expect(visibles.length).toBeGreaterThan(0);
    expect(visibles.length).toBeLessThan(8);
  });
});
