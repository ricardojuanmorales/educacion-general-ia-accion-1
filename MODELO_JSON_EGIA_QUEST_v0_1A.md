# Modelo JSON EGIA Quest v0.1A

## Objeto raíz

```json
{
  "schema_version": "egia-quest.profile-progress.v0.1.0",
  "export_metadata": {},
  "participant": {},
  "privacy_preferences": {},
  "consent": {},
  "progress": {},
  "challenges": {},
  "badges": [],
  "competencies_developed": [],
  "reflections": [],
  "voluntary_evidence": [],
  "ethical_decisions": [],
  "accessibility_actions": [],
  "human_review_notes": [],
  "transversal_project_links": [],
  "app_metadata": {}
}
```

## Privacidad por defecto

- `use_alias: true`
- `identifiable_name_included: false`
- `include_voluntary_evidence: false`
- `allow_repository_archive: false`
- `allow_research_use: false`
- `allow_publication: false`
- `third_party_transfer: false`

## Clasificación de evidencia

| Clasificación | Uso |
|---|---|
| private | Solo participante |
| archivable | Archivo con consentimiento |
| researchable | Investigación con consentimiento |
| publishable | Publicación con autorización |
