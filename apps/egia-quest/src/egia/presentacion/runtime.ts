// Armazón de dependencias: conecta el núcleo heredado con el navegador.
// Local-first: repositorio de localStorage, reloj del sistema, identificadores del navegador.

import { BrowserSessionIdGenerator } from "../../core/adapters/browser/browser-session-id-generator";
import { LocalStorageProjectRepository } from "../../core/adapters/storage/local-storage-project-repository";
import { SystemClock } from "../../core/adapters/system/system-clock";
import { createProject } from "../../core/application/create-project";
import { createCreativeCycleUseCases } from "../../core/application/creative-cycle";
import type { CreativeProject } from "../../core/domain/model";
import type { ProjectId } from "../../core/domain/types";
import { AlmacenDilemas } from "../almacen/dilemas";

export interface Runtime {
  readonly repositorio: LocalStorageProjectRepository;
  readonly ciclo: ReturnType<typeof createCreativeCycleUseCases>;
  readonly dilemas: AlmacenDilemas;
  cargarOCrear(): Promise<CreativeProject>;
}

function almacenamiento(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    // Navegador con almacenamiento bloqueado: la aplicación funciona en memoria durante la sesión.
    return null;
  }
}

export function crearRuntime(almacen: Storage | null = almacenamiento()): Runtime {
  const repositorio = new LocalStorageProjectRepository(almacen);
  const dependencias = {
    repository: repositorio,
    clock: new SystemClock(),
    ids: new BrowserSessionIdGenerator(),
  };
  const ciclo = createCreativeCycleUseCases(dependencias);

  return {
    repositorio,
    ciclo,
    dilemas: new AlmacenDilemas(almacen),
    async cargarOCrear(): Promise<CreativeProject> {
      const reciente = await repositorio.loadMostRecent();
      if (reciente.ok && reciente.value) return reciente.value;

      const creado = await createProject(
        { title: "Mi portafolio EGIA Quest", pseudonym: "Estudiante" },
        dependencias,
      );
      if (!creado.ok) {
        throw new Error(creado.error.safeMessage);
      }
      return creado.value;
    },
  };
}

export function idDeProyecto(proyecto: CreativeProject): ProjectId {
  return proyecto.id;
}
