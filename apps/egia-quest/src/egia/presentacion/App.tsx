// Armazón de la aplicación. Seis secciones, navegación por pestañas accesible.
//
// La navegación por flechas y el `aria-selected` vienen del monolito: se arreglaron allí en
// v0.1B y sería absurdo perderlos al migrar. Lo que no se hereda es el aviso fuera de la
// tarjeta: eso fue el bug, no la solución.

import { useEffect, useRef, useState } from "react";

import {
  CATALOGO_DILEMAS,
  CATALOGO_RETOS,
  DECISION_HERRAMIENTAS,
  GLOSARIO,
  HERRAMIENTAS,
  METODO_GLOSARIO,
} from "../contenido/catalogo";
import { resolucionDe } from "../dominio/dilema";
import { Glosario } from "./Glosario";
import { Herramientas } from "./Herramientas";
import { ListaDilemas } from "./ListaDilemas";
import { ListaRetos } from "./ListaRetos";
import { PantallaDilema } from "./PantallaDilema";
import { PantallaReto } from "./PantallaReto";
import { Portafolio } from "./Portafolio";
import { Tablero } from "./Tablero";
import { useEgia } from "./useEgia";
import type { Runtime } from "./runtime";

type Seccion = "tablero" | "retos" | "dilemas" | "glosario" | "herramientas" | "portafolio";

// El orden importa: primero lo que se hace, después lo que se consulta, al final lo que se
// conserva. Glosario y Herramientas van en medio porque es donde se necesitan, a mitad de un reto.
const SECCIONES: ReadonlyArray<{ id: Seccion; etiqueta: string }> = [
  { id: "tablero", etiqueta: "Tablero" },
  { id: "retos", etiqueta: "Retos" },
  { id: "dilemas", etiqueta: "Dilemas" },
  { id: "glosario", etiqueta: "Glosario" },
  { id: "herramientas", etiqueta: "Herramientas" },
  { id: "portafolio", etiqueta: "Portafolio" },
];

export interface AppProps {
  readonly runtime?: Runtime;
}

export function App({ runtime }: AppProps = {}) {
  const estado = useEgia(runtime);
  const [seccion, setSeccion] = useState<Seccion>("tablero");
  const [retoAbierto, setRetoAbierto] = useState<string | null>(null);
  const [dilemaAbierto, setDilemaAbierto] = useState<string | null>(null);
  const pestanas = useRef<Array<HTMLButtonElement | null>>([]);
  const encabezadoSeccion = useRef<HTMLHeadingElement>(null);

  // Al cambiar de sección el foco va al encabezado, no se queda huérfano en la pestaña.
  useEffect(() => {
    encabezadoSeccion.current?.focus();
  }, [seccion, retoAbierto, dilemaAbierto]);

  function irA(destino: Seccion, retoId?: string) {
    setSeccion(destino);
    setRetoAbierto(retoId ?? null);
    setDilemaAbierto(null);
  }

  function porFlechas(evento: React.KeyboardEvent, indice: number) {
    const salto = evento.key === "ArrowRight" ? 1 : evento.key === "ArrowLeft" ? -1 : 0;
    if (salto === 0) return;
    evento.preventDefault();
    const siguiente = (indice + salto + SECCIONES.length) % SECCIONES.length;
    const destino = SECCIONES[siguiente];
    if (!destino) return;
    irA(destino.id);
    pestanas.current[siguiente]?.focus();
  }

  if (estado.errorFatal) {
    return (
      <main className="capa capa--error">
        <h1>No se pudo abrir tu portafolio local</h1>
        <p role="alert">{estado.errorFatal}</p>
        <p>
          EGIA Quest guarda todo en tu navegador. Si tienes el almacenamiento bloqueado o la
          ventana está en modo privado, no hay dónde guardar. Nada se ha perdido: no había nada
          en ningún servidor.
        </p>
      </main>
    );
  }

  const reto = retoAbierto ? CATALOGO_RETOS.porReto.get(retoAbierto) : undefined;
  const definicion = reto
    ? CATALOGO_RETOS.definiciones.find((d) => d.id === reto.missionId)
    : undefined;
  const dilema = dilemaAbierto ? CATALOGO_DILEMAS.find((d) => d.id === dilemaAbierto) : undefined;

  return (
    <div className="app">
      <header className="cabecera">
        <p className="cabecera__marca">
          EGIA Quest <span className="cabecera__version">v1.0.0 · vista previa</span>
        </p>
        <h1 className="cabecera__lema">La ética no adorna el juego. La ética es la mecánica.</h1>
        <p className="cabecera__nota">
          Todo se guarda en este navegador. Sin cuenta, sin servidor, sin telemetría.
        </p>
      </header>

      <nav className="pestanas" aria-label="Secciones">
        <div role="tablist" aria-label="Secciones de EGIA Quest">
          {SECCIONES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`pestana-${s.id}`}
              className="pestana"
              aria-selected={seccion === s.id}
              aria-controls={`panel-${s.id}`}
              tabIndex={seccion === s.id ? 0 : -1}
              ref={(el) => {
                pestanas.current[i] = el;
              }}
              onKeyDown={(e) => porFlechas(e, i)}
              onClick={() => irA(s.id)}
            >
              {s.etiqueta}
            </button>
          ))}
        </div>
      </nav>

      <main
        className="panel"
        role="tabpanel"
        id={`panel-${seccion}`}
        aria-labelledby={`pestana-${seccion}`}
        tabIndex={-1}
      >
        {estado.cargando ? (
          <p className="vacio">Abriendo tu portafolio local…</p>
        ) : (
          <>
            {seccion === "tablero" ? (
              <>
                <h2 ref={encabezadoSeccion} tabIndex={-1} className="panel__titulo">
                  Tu progreso
                </h2>
                <Tablero
                  progreso={estado.progreso}
                  totalRetos={estado.retos.length}
                  totalDilemas={CATALOGO_DILEMAS.length}
                  puntosPosibles={estado.puntosPosibles}
                  alAbrirReto={(retoId) => irA("retos", retoId)}
                />
              </>
            ) : null}

            {seccion === "retos" ? (
              reto && definicion ? (
                <>
                  <h2 ref={encabezadoSeccion} tabIndex={-1} className="visualmente-oculto">
                    Reto {reto.retoId}
                  </h2>
                  <PantallaReto
                    reto={reto}
                    definicion={definicion}
                    proyecto={estado.proyecto}
                    acciones={estado.accionesDeReto(reto)}
                    retosCompletados={estado.progreso.retosCompletados}
                    alVolver={() => setRetoAbierto(null)}
                  />
                </>
              ) : (
                <>
                  <h2 ref={encabezadoSeccion} tabIndex={-1} className="panel__titulo">
                    Los quince retos
                  </h2>
                  <ListaRetos
                    retos={estado.retos}
                    titulos={estado.titulos}
                    proyecto={estado.proyecto}
                    retosCompletados={estado.progreso.retosCompletados}
                    alAbrir={(retoId) => setRetoAbierto(retoId)}
                  />
                </>
              )
            ) : null}

            {seccion === "dilemas" ? (
              dilema ? (
                <>
                  <h2 ref={encabezadoSeccion} tabIndex={-1} className="visualmente-oculto">
                    Dilema {dilema.id}
                  </h2>
                  <PantallaDilema
                    dilema={dilema}
                    resolucion={resolucionDe(estado.estadoDilemas, dilema.id)}
                    alResolver={(opcion, justificacion, reparacion) =>
                      estado.resolverDilema(dilema.id, opcion, justificacion, reparacion)
                    }
                    alVolver={() => setDilemaAbierto(null)}
                  />
                </>
              ) : (
                <>
                  <h2 ref={encabezadoSeccion} tabIndex={-1} className="panel__titulo">
                    Los doce dilemas
                  </h2>
                  <ListaDilemas
                    dilemas={CATALOGO_DILEMAS}
                    estado={estado.estadoDilemas}
                    alAbrir={(id) => setDilemaAbierto(id)}
                  />
                </>
              )
            ) : null}

            {seccion === "glosario" ? (
              <>
                <h2 ref={encabezadoSeccion} tabIndex={-1} className="panel__titulo">
                  Glosario
                </h2>
                <Glosario terminos={GLOSARIO} metodo={METODO_GLOSARIO} />
              </>
            ) : null}

            {seccion === "herramientas" ? (
              <>
                <h2 ref={encabezadoSeccion} tabIndex={-1} className="panel__titulo">
                  Herramientas de IA
                </h2>
                <Herramientas fichas={HERRAMIENTAS} decisionDeDiseno={DECISION_HERRAMIENTAS} />
              </>
            ) : null}

            {seccion === "portafolio" ? (
              <>
                <h2 ref={encabezadoSeccion} tabIndex={-1} className="panel__titulo">
                  Tu portafolio
                </h2>
                <Portafolio
                  proyecto={estado.proyecto}
                  metadatosPorMision={CATALOGO_RETOS.metadatos}
                  titulos={estado.titulos}
                  alCurar={estado.curar}
                  alRetirar={estado.retirar}
                />
              </>
            ) : null}
          </>
        )}
      </main>

      <footer className="pie">
        <p>
          Prototipo de Fase 3. Contenido aprobado el 29 de agosto de 2026 (DEC-EGIA-040). El
          nivel se gana recorriendo, no acumulando (DEC-EGIA-044).
        </p>
        <button
          type="button"
          className="boton boton--discreto"
          onClick={() => {
            if (
              globalThis.confirm?.(
                "Esto borra tu portafolio y tus decisiones de este navegador. No hay copia en ningún servidor: no se puede deshacer. ¿Seguir?",
              )
            ) {
              void estado.borrarTodo();
            }
          }}
        >
          Borrar todos mis datos de este navegador
        </button>
      </footer>
    </div>
  );
}
