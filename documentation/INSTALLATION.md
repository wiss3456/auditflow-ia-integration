# Installation

Ce repository n'est pas une application unique a lancer en bloc.

Chaque projet doit etre installe separement depuis son propre dossier :

- `AuditFlow.API/`
- `RiskAdviserCn/`
- `Knowledge_API/`
- `Verification-API/`

## Recuperation du depot

Utiliser :

```bash
git clone --recurse-submodules https://github.com/rimdiab/auditFlow-doc.git
```

Si le depot est deja clone sans submodules :

```bash
git submodule update --init --recursive
```

## Regle generale

Pour installer un projet :

1. ouvrir son dossier
2. lire son `README.md`
3. installer ses dependances
4. appliquer sa propre configuration locale

## Important

Ne pas essayer de mutualiser :

- les environnements Python
- les dependances Node.js
- les fichiers `.env`
- les ports
- les versions d'outils

L'objectif de ce depot est l'organisation, pas la fusion d'execution.
