# src/egia — código propio de EGIA Quest

Aquí vive todo lo que EGIA Quest añade sobre el núcleo copiado de AI StoryLab.

La regla de `DEC-EGIA-024`: `src/core/` no se edita nunca. Si algo del núcleo necesita
comportarse distinto, se extiende desde aquí; no se modifica allí. `npm run verify:core-parity`
falla si alguien rompe esa regla.
