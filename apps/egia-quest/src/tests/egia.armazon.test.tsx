// @vitest-environment jsdom

// Pruebas del armazón de Fase 3: las cuatro secciones sobre persistencia real de localStorage.
//
// Estas pruebas corren contra el runtime completo —repositorio de localStorage, reloj y
// generador de identificadores del núcleo heredado— y no contra dobles. Un armazón que solo
// funciona con dobles no es un prototipo funcional.

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CATALOGO_DILEMAS, CATALOGO_RETOS } from "../egia/contenido/catalogo";
import { AlmacenDilemas, CLAVE_DILEMAS } from "../egia/almacen/dilemas";
import { calcularProgreso } from "../egia/dominio/progreso";
import { ESTADO_DILEMAS_VACIO } from "../egia/dominio/dilema";
import { App } from "../egia/presentacion/App";
import { crearRuntime } from "../egia/presentacion/runtime";

/** localStorage de juguete, suficiente para el repositorio del núcleo. */
class AlmacenDePrueba implements Storage {
  #datos = new Map<string, string>();
  get length() {
    return this.#datos.size;
  }
  key(i: number) {
    return [...this.#datos.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.#datos.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.#datos.set(k, String(v));
  }
  removeItem(k: string) {
    this.#datos.delete(k);
  }
  clear() {
    this.#datos.clear();
  }
  [nombre: string]: unknown;
}

let almacen: AlmacenDePrueba;

beforeEach(() => {
  almacen = new AlmacenDePrueba();
});

afterEach(() => {
  cleanup();
});

function montar() {
  return render(<App runtime={crearRuntime(almacen)} />);
}

/**
 * Espera a que la tarjeta del reto llegue al paso pedido antes de seguir escribiendo.
 *
 * No es adorno: cada acción del reto llama al motor de forma asíncrona, y sin esta espera
 * la prueba escribe en el `textarea` del paso anterior, que todavía sigue en el DOM. La
 * primera versión de esta prueba tenía justo ese fallo y parecía un bug de la aplicación.
 */
async function esperarPaso(paso: string) {
  await waitFor(() =>
    expect(document.querySelector("[data-paso]")?.getAttribute("data-paso")).toBe(paso),
  );
  return screen.getByRole("textbox");
}

describe("Armazón · las seis secciones", () => {
  it("abre en el tablero y ofrece las seis secciones como pestañas", async () => {
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });
    const tablist = screen.getByRole("tablist");
    const pestanas = within(tablist).getAllByRole("tab");
    expect(pestanas.map((p) => p.textContent)).toEqual([
      "Tablero",
      "Retos",
      "Dilemas",
      "Glosario",
      "Herramientas",
      "Portafolio",
    ]);
    expect(pestanas[0]?.getAttribute("aria-selected")).toBe("true");
  });

  it("ofrece saltar al contenido antes que las seis pestañas", async () => {
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });
    const salto = screen.getByRole("link", { name: "Saltar al contenido" });
    expect(salto.getAttribute("href")).toBe("#panel-principal");
    // Y el destino existe de verdad: un enlace de salto roto es peor que no tenerlo.
    expect(document.getElementById("panel-principal")).not.toBeNull();
    // Es lo primero que encuentra el teclado, antes de la cabecera y de las pestañas.
    const enfocables = [...document.querySelectorAll("a[href], button:not([tabindex='-1'])")];
    expect(enfocables[0]).toBe(salto);
  });

  it("las flechas mueven entre pestañas, como en el monolito v0.1B", async () => {
    const usuario = userEvent.setup();
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });

    const tablero = screen.getByRole("tab", { name: "Tablero" });
    tablero.focus();
    await usuario.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "Retos" }).getAttribute("aria-selected")).toBe("true");
    expect(await screen.findByRole("heading", { name: "Los quince retos" })).toBeDefined();
  });

  it("la lista muestra los quince retos y los doce dilemas del contenido aprobado", async () => {
    const usuario = userEvent.setup();
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });

    await usuario.click(screen.getByRole("tab", { name: "Retos" }));
    const listaRetos = await screen.findByRole("heading", { name: "Los quince retos" });
    expect(listaRetos).toBeDefined();
    expect(document.querySelectorAll("[data-reto]")).toHaveLength(CATALOGO_RETOS.porReto.size);
    expect(CATALOGO_RETOS.porReto.size).toBe(15);

    await usuario.click(screen.getByRole("tab", { name: "Dilemas" }));
    await screen.findByRole("heading", { name: "Los doce dilemas" });
    expect(CATALOGO_DILEMAS).toHaveLength(12);
    expect(screen.getAllByRole("button", { name: "Abrir dilema" })).toHaveLength(12);
  });
});

describe("Armazón · recorrido completo de un reto con persistencia real", () => {
  it("de iniciar a completado, y la evidencia aparece lista para curar", async () => {
    const usuario = userEvent.setup();
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });

    await usuario.click(screen.getByRole("tab", { name: "Retos" }));
    const tarjeta = await screen.findByRole("heading", { name: /Di lo que usaste/ });
    await usuario.click(
      within(tarjeta.closest("article")!).getByRole("button", { name: "Abrir reto" }),
    );

    await usuario.click(await screen.findByRole("button", { name: "Iniciar" }));

    await usuario.type(
      await esperarPaso("actividad"),
      "Reorganicé tres párrafos y revisé cada cambio.",
    );
    await usuario.click(screen.getByRole("button", { name: "Guardar trabajo" }));

    await usuario.type(
      await esperarPaso("evidencia"),
      "Párrafo de disclosure con herramienta, versión, propósito y límite.",
    );
    await usuario.click(screen.getByRole("button", { name: "Guardar evidencia" }));

    await usuario.type(
      await esperarPaso("reflexion"),
      "Me costó admitir cuánto delegué en la reorganización.",
    );
    await usuario.click(screen.getByRole("button", { name: "Guardar reflexión" }));

    // Paso 4: la decisión. Sin ella el reto no cierra.
    await esperarPaso("decision");
    expect(screen.getByText(/paso 4 de 4/)).toBeDefined();
    await usuario.click(
      screen.getByRole("button", { name: "Registrar mi decisión y cerrar el reto" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("Reto completado"),
    );

    // El portafolio ve la evidencia elegible, pero todavía no curada.
    await usuario.click(screen.getByRole("tab", { name: "Portafolio" }));
    await screen.findByRole("heading", { name: "Listas para curar (1)" });
    expect(screen.getByRole("heading", { name: "En tu portafolio (0)" })).toBeDefined();

    await usuario.click(screen.getByRole("button", { name: "Añadir al portafolio" }));
    await screen.findByRole("heading", { name: "En tu portafolio (1)" });
  });

  it("el progreso queda escrito en el almacenamiento y sobrevive a recargar", async () => {
    const usuario = userEvent.setup();
    const { unmount } = montar();
    await screen.findByRole("heading", { name: "Tu progreso" });

    await usuario.click(screen.getByRole("tab", { name: "Retos" }));
    const tarjeta = await screen.findByRole("heading", { name: /Di lo que usaste/ });
    await usuario.click(
      within(tarjeta.closest("article")!).getByRole("button", { name: "Abrir reto" }),
    );
    await usuario.click(await screen.findByRole("button", { name: "Iniciar" }));
    await usuario.type(await esperarPaso("actividad"), "Trabajo guardado antes de recargar.");
    await usuario.click(screen.getByRole("button", { name: "Guardar trabajo" }));
    await esperarPaso("evidencia");

    unmount();
    cleanup();

    // Segundo montaje sobre el MISMO almacenamiento: simula recargar la pestaña.
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });
    await usuario.click(screen.getByRole("tab", { name: "Retos" }));
    const tarjeta2 = await screen.findByRole("heading", { name: /Di lo que usaste/ });
    expect(
      within(tarjeta2.closest("article")!).getByText(/falta tu evidencia/),
    ).toBeDefined();
  });
});

describe("Armazón · dilemas", () => {
  it("la consecuencia solo aparece después de decidir y justificar", async () => {
    const usuario = userEvent.setup();
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });
    await usuario.click(screen.getByRole("tab", { name: "Dilemas" }));

    const primero = CATALOGO_DILEMAS[0]!;
    const opcionEvasiva = primero.opciones.find((o) => o.calidad !== "cuidadosa")!;

    await usuario.click(screen.getAllByRole("button", { name: "Abrir dilema" })[0]!);
    await screen.findByRole("heading", { name: primero.titulo });

    // Antes de decidir, ninguna consecuencia está a la vista.
    expect(screen.queryByText(opcionEvasiva.consecuencia)).toBeNull();

    await usuario.click(screen.getByRole("radio", { name: opcionEvasiva.texto }));
    await usuario.click(screen.getByRole("button", { name: "Decidir y ver la consecuencia" }));

    // Sin justificación suficiente, no se revela nada.
    expect(screen.getByRole("alert").textContent).toContain("Escribe tu razón");
    expect(screen.queryByText(opcionEvasiva.consecuencia)).toBeNull();

    await usuario.type(
      screen.getByRole("textbox"),
      "Elijo esta porque me pareció la salida más rápida.",
    );
    await usuario.click(screen.getByRole("button", { name: "Decidir y ver la consecuencia" }));

    expect(await screen.findByText(opcionEvasiva.consecuencia)).toBeDefined();
    // DEC-EGIA-026: una decisión no cuidadosa ofrece reparación.
    expect(opcionEvasiva.reparacion).not.toBeNull();
    expect(screen.getByText(opcionEvasiva.reparacion!)).toBeDefined();
  });

  it("la resolución se guarda bajo la clave propia de EGIA, aparte del proyecto", async () => {
    const usuario = userEvent.setup();
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });
    await usuario.click(screen.getByRole("tab", { name: "Dilemas" }));
    await usuario.click(screen.getAllByRole("button", { name: "Abrir dilema" })[0]!);

    const primero = CATALOGO_DILEMAS[0]!;
    const cuidadosa = primero.opciones.find((o) => o.calidad === "cuidadosa")!;
    await usuario.click(screen.getByRole("radio", { name: cuidadosa.texto }));
    await usuario.type(screen.getByRole("textbox"), "Prefiero preguntar antes que suponer.");
    await usuario.click(screen.getByRole("button", { name: "Decidir y ver la consecuencia" }));

    await waitFor(() => expect(almacen.getItem(CLAVE_DILEMAS)).not.toBeNull());
    const guardado = new AlmacenDilemas(almacen).leer();
    expect(guardado.resoluciones).toHaveLength(1);
    expect(guardado.resoluciones[0]?.dilemaId).toBe(primero.id);
    expect(guardado.resoluciones[0]?.calidad).toBe("cuidadosa");
  });
});

describe("Armazón · el tablero dice la verdad sobre sí mismo", () => {
  it("DEC-EGIA-044 · muestra la escalera de tramos, no un marcador de puntos", async () => {
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });

    // Los siete tramos están a la vista, incluidos los que faltan por recorrer.
    expect(document.querySelectorAll("[data-nivel]")).toHaveLength(7);
    expect(screen.getByText(/El nivel no se compra con puntos/)).toBeDefined();

    // Y los puntos siguen ahí, pero declarados como lo que son.
    expect(screen.getByText("Puntos de cuidado")).toBeDefined();
    expect(screen.getByText(/señal de cuidado, no una moneda/)).toBeDefined();
  });

  it("empieza en Q0 con todos los tramos superiores sin pisar", async () => {
    montar();
    await screen.findByRole("heading", { name: "Tu progreso" });
    const pisados = document.querySelectorAll('[data-nivel][data-pisado="true"]');
    expect(pisados).toHaveLength(1);
    expect(pisados[0]?.getAttribute("data-nivel")).toBe("Q0");
    expect(document.querySelector('[data-actual="true"]')?.getAttribute("data-nivel")).toBe("Q0");
  });

  it("un proyecto vacío no suma puntos ni inventa competencias", () => {
    const progreso = calcularProgreso(
      null,
      [...CATALOGO_RETOS.porReto.values()],
      CATALOGO_DILEMAS,
      ESTADO_DILEMAS_VACIO,
    );
    expect(progreso.puntos).toBe(0);
    expect(progreso.nivel).toBe("Q0");
    expect(progreso.competencias).toHaveLength(0);
    expect(progreso.deudaPedagogica).toHaveLength(0);
  });
});
