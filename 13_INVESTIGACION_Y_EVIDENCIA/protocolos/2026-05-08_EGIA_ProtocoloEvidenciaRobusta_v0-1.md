# Protocolo de Evidencia Robusta v0.1
## EGIA-Accion

## Principio

La evidencia será voluntaria, archivable, investigable y exportable, siempre bajo consentimiento, privacidad, atribución, anonimización y gobernanza.

## Niveles de evidencia

| Nivel | Descripción | Uso permitido |
|---|---|---|
| E0 | Registro interno: bitácoras, decisiones y estructura | Monitoreo interno |
| E1 | Evidencia pedagógica mínima | Mejora formativa |
| E2 | Evidencia documentada con metadatos | Archivo y análisis |
| E3 | Evidencia investigable anonimizable | Investigación educativa |
| E4 | Evidencia publicable autorizada | WordPress, informes, guías |
| E5 | Evidencia interoperable | MD, JSON, CSV u otros |

## Campos mínimos del evidence ledger

```json
{
  "id_evidencia": "EGIA-EVID-0001",
  "fecha": "AAAA-MM-DD",
  "tipo": "bitacora_sesion",
  "titulo": "",
  "responsable": "",
  "nivel_evidencia": "E0",
  "consentimiento": "",
  "anonimizacion": "",
  "uso_permitido": [],
  "formato": ["md", "json"],
  "ubicacion": "",
  "estado": "borrador",
  "riesgos": [],
  "proxima_accion": ""
}
```
