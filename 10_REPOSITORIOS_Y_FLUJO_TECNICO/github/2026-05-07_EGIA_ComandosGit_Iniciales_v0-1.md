# Comandos Git Iniciales v0.1
## EGIA-Accion

Desde la terminal:

```bash
cd Educacion_General_IA_Accion
git init
git add .
git commit -m "Activación documental inicial de EGIA-Accion"
```

## Opción A: crear repositorio con GitHub CLI

```bash
gh repo create Educacion_General_IA_Accion --private --source=. --remote=origin --push
```

Cambiar `--private` por `--public` solo si ya se revisaron privacidad, permisos, licencias y datos sensibles.

## Opción B: si el repositorio ya existe en GitHub

```bash
git remote add origin https://github.com/USUARIO/Educacion_General_IA_Accion.git
git branch -M main
git push -u origin main
```

## Primer release sugerido

```text
v0.1-activacion-documental
```
