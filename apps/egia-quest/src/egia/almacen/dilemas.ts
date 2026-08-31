// Almacén local de las resoluciones de dilema. Vive aparte del proyecto del núcleo porque el
// núcleo no modela decisiones ramificadas (DEUDA-EGIA-021).
//
// Local-first igual que todo lo demás: nada sale de este navegador sin decisión explícita.

import {
  ESTADO_DILEMAS_VACIO,
  type EstadoDilemas,
  type ResolucionDilema,
} from "../dominio/dilema";

export const CLAVE_DILEMAS = "egiaQuest.dilemas.v1";

export interface AlmacenLike {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

export class AlmacenDilemas {
  constructor(private readonly almacen: AlmacenLike | null) {}

  leer(): EstadoDilemas {
    if (!this.almacen) return ESTADO_DILEMAS_VACIO;
    try {
      const crudo = this.almacen.getItem(CLAVE_DILEMAS);
      if (!crudo) return ESTADO_DILEMAS_VACIO;
      const datos = JSON.parse(crudo) as Partial<EstadoDilemas>;
      const resoluciones = Array.isArray(datos.resoluciones) ? datos.resoluciones : [];
      return { resoluciones };
    } catch {
      // Un almacén corrupto no debe tumbar la aplicación: se empieza limpio y se avisa arriba.
      return ESTADO_DILEMAS_VACIO;
    }
  }

  registrar(resolucion: ResolucionDilema): EstadoDilemas {
    const actual = this.leer();
    const sinEse = actual.resoluciones.filter((r) => r.dilemaId !== resolucion.dilemaId);
    const siguiente: EstadoDilemas = { resoluciones: [...sinEse, resolucion] };
    this.guardar(siguiente);
    return siguiente;
  }

  borrar(): EstadoDilemas {
    this.almacen?.removeItem(CLAVE_DILEMAS);
    return ESTADO_DILEMAS_VACIO;
  }

  private guardar(estado: EstadoDilemas): void {
    try {
      this.almacen?.setItem(CLAVE_DILEMAS, JSON.stringify(estado));
    } catch {
      // Cuota llena o almacenamiento bloqueado. El estado en memoria sigue siendo válido.
    }
  }
}
