// Cargadores del glosario y de las fichas de herramienta.
//
// Igual que los otros cargadores: el contenido ya pasó `npm run validate:content` en el Gate 1,
// así que aquí no se repite la validación de forma. Se comprueban las invariantes que romperían
// la pantalla en tiempo de ejecución, y una que es de fondo, no de forma:
//
//   Toda referencia cruzada del glosario tiene que resolver a un término existente.
//
// Esa comprobación existe porque ya falló una vez: la primera redacción del glosario tenía nueve
// referencias rotas. Un glosario que se remite a sí mismo y falla es peor que uno sin remisiones.

import { ErrorDeContenido } from "./cargar-retos";
import type { FichaHerramienta, TerminoGlosario } from "../dominio/referencia";

function texto(valor: unknown, campo: string, donde?: string): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new ErrorDeContenido(`El campo «${campo}» falta o está vacío`, donde);
  }
  return valor;
}

function lista(valor: unknown): readonly string[] {
  return Array.isArray(valor) ? valor.map(String) : [];
}

export function cargarGlosario(datos: unknown): readonly TerminoGlosario[] {
  if (
    typeof datos !== "object" ||
    datos === null ||
    !Array.isArray((datos as { terminos?: unknown }).terminos)
  ) {
    throw new ErrorDeContenido("El glosario no tiene una lista de términos");
  }

  const crudos = (datos as { terminos: Record<string, unknown>[] }).terminos;
  const salida: TerminoGlosario[] = [];
  const vistos = new Set<string>();

  for (const crudo of crudos) {
    const termino = texto(crudo.termino, "termino");
    if (vistos.has(termino)) {
      throw new ErrorDeContenido("Término repetido en el glosario", termino);
    }
    vistos.add(termino);

    salida.push({
      termino,
      definicionBreve: texto(crudo.definicion_breve, "definicion_breve", termino),
      definicionOperativa: texto(crudo.definicion_operativa, "definicion_operativa", termino),
      // La distinción es obligatoria por método: es la parte que evita el uso decorativo.
      distincion: texto(crudo.distincion, "distincion", termino),
      relacionados: lista(crudo.relacionados),
      fuente: texto(crudo.fuente, "fuente", termino),
      notaPendiente: typeof crudo.nota_pendiente === "string" ? crudo.nota_pendiente : null,
    });
  }

  for (const t of salida) {
    for (const r of t.relacionados) {
      if (!vistos.has(r)) {
        throw new ErrorDeContenido(`Remite a «${r}», que no existe en el glosario`, t.termino);
      }
    }
  }

  return salida.sort((a, b) => a.termino.localeCompare(b.termino, "es"));
}

export function cargarHerramientas(datos: unknown): readonly FichaHerramienta[] {
  if (
    typeof datos !== "object" ||
    datos === null ||
    !Array.isArray((datos as { herramientas?: unknown }).herramientas)
  ) {
    throw new ErrorDeContenido("El catálogo no tiene una lista de herramientas");
  }

  const crudos = (datos as { herramientas: Record<string, unknown>[] }).herramientas;

  return crudos.map((crudo) => {
    const id = String(crudo.id ?? "");
    if (!/^EGIA-H-\d{3}$/.test(id)) {
      throw new ErrorDeContenido(`Identificador de herramienta inválido: ${id}`);
    }
    return {
      id,
      // El campo es el TIPO, no un producto. Si algún día aquí aparece una marca, es un error
      // de contenido, no una mejora (decisión de diseño del catálogo de herramientas).
      tipo: texto(crudo.tipo, "tipo", id),
      nivelSugerido: texto(crudo.nivel_sugerido, "nivel_sugerido", id),
      competencias: lista(crudo.competencias),
      queHace: texto(crudo.que_hace, "que_hace", id),
      queNoHace: texto(crudo.que_no_hace, "que_no_hace", id),
      datosQueToca: texto(crudo.datos_que_toca, "datos_que_toca", id),
      riesgosTipicos: lista(crudo.riesgos_tipicos),
      cuandoNoUsar: texto(crudo.cuando_no_usar, "cuando_no_usar", id),
      senalesDeAlerta: lista(crudo.senales_de_alerta),
      preguntasAntesDeUsar: lista(crudo.preguntas_antes_de_usar),
    };
  });
}
