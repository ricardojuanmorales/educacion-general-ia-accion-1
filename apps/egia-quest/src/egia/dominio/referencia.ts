// Tipos de las dos secciones de referencia: glosario y fichas de herramienta.
//
// Ninguna de las dos pasa por el motor heredado: son contenido de consulta, no ciclo creativo.
// No producen evidencia, no dan puntos y no tienen estado que guardar. Están en la aplicación
// porque el trabajo de los retos las necesita a mano, no porque haya que «completarlas».

/** Una entrada del glosario. La distinción —qué NO es— es la pieza que evita el uso decorativo. */
export interface TerminoGlosario {
  readonly termino: string;
  readonly definicionBreve: string;
  readonly definicionOperativa: string;
  readonly distincion: string;
  readonly relacionados: readonly string[];
  readonly fuente: string;
  /** Nota de deuda visible en la propia entrada. Hoy solo la tiene IBATA (DEUDA-EGIA-019). */
  readonly notaPendiente: string | null;
}

/**
 * Ficha de un TIPO de herramienta, nunca de un producto concreto (decisión de contenido).
 *
 * Una ficha con nombres y versiones caduca en meses y convierte el contenido pedagógico en
 * mantenimiento perpetuo. La aplicación aporta la rejilla de criterios; el reto EGIA-R-012 pide
 * que sea la persona quien pruebe y compare tres herramientas reales.
 */
export interface FichaHerramienta {
  readonly id: string;
  readonly tipo: string;
  readonly nivelSugerido: string;
  readonly competencias: readonly string[];
  readonly queHace: string;
  readonly queNoHace: string;
  readonly datosQueToca: string;
  readonly riesgosTipicos: readonly string[];
  readonly cuandoNoUsar: string;
  readonly senalesDeAlerta: readonly string[];
  readonly preguntasAntesDeUsar: readonly string[];
}

/** Normaliza para buscar sin acentos ni mayúsculas: «declaracion» encuentra «Declaración». */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filtrarTerminos(
  terminos: readonly TerminoGlosario[],
  consulta: string,
): readonly TerminoGlosario[] {
  const q = normalizar(consulta);
  if (q.length === 0) return terminos;
  return terminos.filter((t) =>
    [t.termino, t.definicionBreve, t.definicionOperativa, t.distincion]
      .map(normalizar)
      .some((campo) => campo.includes(q)),
  );
}

export function filtrarHerramientas(
  fichas: readonly FichaHerramienta[],
  consulta: string,
): readonly FichaHerramienta[] {
  const q = normalizar(consulta);
  if (q.length === 0) return fichas;
  return fichas.filter((f) =>
    [f.tipo, f.queHace, f.queNoHace, f.cuandoNoUsar, f.datosQueToca]
      .map(normalizar)
      .some((campo) => campo.includes(q)),
  );
}

/** Agrupa los términos por su inicial, ya normalizada, para el índice alfabético. */
export function porInicial(
  terminos: readonly TerminoGlosario[],
): ReadonlyArray<{ inicial: string; terminos: readonly TerminoGlosario[] }> {
  const mapa = new Map<string, TerminoGlosario[]>();
  for (const t of terminos) {
    const inicial = normalizar(t.termino).charAt(0).toUpperCase() || "#";
    const grupo = mapa.get(inicial);
    if (grupo) grupo.push(t);
    else mapa.set(inicial, [t]);
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([inicial, terminos]) => ({ inicial, terminos }));
}
