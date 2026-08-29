# src/core — núcleo copiado, no editable

Este directorio es una **copia verbatim** del núcleo de AI StoryLab 1. Ejecuta `DEC-EGIA-024`:
EGIA Quest reutiliza el motor sin tocar el repositorio de AI StoryLab, que está publicado y
verificado en v1.0.0.

- **Origen:** `github.com/ricardojuanmorales/ai-storylab-1`, `apps/storylab/src/`
- **Commit de origen:** `6ef7fb3`
- **Fecha de la copia:** 2026-08-29
- **Qué se copió:** `domain/`, `ports/`, `adapters/`, `schemas/` y los casos de uso de portafolio,
  ciclo creativo y manejo seguro de errores de `application/`.
- **Qué NO se copió:** `presentation/` (EGIA Quest tiene su propia interfaz), el catálogo de
  contenido de StoryLab y su suite de pruebas completa.

## Regla

**Ningún archivo bajo `src/core/` se edita.** El código propio de EGIA Quest vive en `src/egia/` y
extiende el núcleo desde fuera. Editar aquí rompe la paridad y convierte una copia en una
bifurcación silenciosa, que es exactamente lo que `DEUDA-EGIA-007` vigila.

## Verificación

`npm run verify:core-parity` compara cada archivo contra el manifiesto de hashes registrado en el
momento de la copia y falla si alguno cambió.

**Límite declarado:** la verificación detecta deriva **local**, no deriva **de origen**. Si AI
StoryLab avanza, este comando no lo sabrá: hace falta volver a copiar desde el commit nuevo y
regenerar el manifiesto. Queda registrado como parte de `DEUDA-EGIA-007`.
