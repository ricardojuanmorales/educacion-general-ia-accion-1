# EGIA Quest v0.1A

**MVP monolítico HTML + JSON + Markdown** para el proyecto **Educación General e Inteligencia Artificial en Acción**.

Este prototipo está diseñado para publicarse en **GitHub Pages sin GitHub Actions**, sin npm, sin React y sin proceso de build.

## Qué incluye

- `index.html` autosuficiente.
- Datos simulados integrados en JavaScript como objetos JSON.
- Perfil local con alias.
- Privacidad por defecto.
- Retos formativos.
- Dilemas éticos.
- Mini-bitácora.
- Badges.
- Exportación JSON.
- Exportación Markdown.
- Uso de `localStorage`.
- Documentación básica.

## Cómo probar localmente

Abre `index.html` en tu navegador.

No necesitas instalar nada.

## Cómo publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `egia-quest`.
2. Sube `index.html` y los archivos `.md`.
3. Ve a **Settings → Pages**.
4. En **Source**, selecciona **Deploy from a branch**.
5. En **Branch**, selecciona `main` y `/root`.
6. Guarda.
7. GitHub generará una URL como:

```text
https://TU-USUARIO.github.io/egia-quest/
```

## Regla de privacidad

No publiques datos reales de participantes en este repositorio. El MVP debe usar datos simulados o exportaciones revisadas y autorizadas.

## Próxima versión sugerida

- Separar datos en archivos JSON externos.
- Añadir importación de perfil JSON.
- Añadir validación JSON Schema.
- Preparar versión React cuando el flujo esté validado.
