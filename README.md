# auditFlow-doc

Ce repository sert de depot d'organisation et de reference. Il regroupe plusieurs projets lies a `AuditFlow` sans fusionner leurs fichiers.

Chaque projet est integre comme submodule Git dans son propre dossier pour eviter :

- le melange des dependances
- les conflits de versions
- les collisions de configuration
- les erreurs entre stacks techniques differentes

## Contenu

- `AuditFlow.API/`
- `RiskAdviserCn/`
- `Knowledge_API/`
- `Verification-API/`
- `documentation/pdfs/`

## Principe

Ce depot n'unifie pas les applications en un seul projet executable.
Il centralise seulement :

- les references Git separees vers chaque projet
- les documents PDF associes
- la documentation d'organisation du repository

## Clonage

Pour recuperer le depot avec tous les projets :

```bash
git clone --recurse-submodules https://github.com/rimdiab/auditFlow-doc.git
```

La documentation principale se trouve dans [documentation/README_GLOBAL.md](./documentation/README_GLOBAL.md).
