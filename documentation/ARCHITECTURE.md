# Organisation du repository

## Principe

Le repository est organise par projets separes.
Chaque codebase reste isolee dans son propre dossier.

## Arborescence

```text
auditflow-doc/
|-- AuditFlow.API/
|-- RiskAdviserCn/
|-- Knowledge_API/
|-- Verification-API/
|-- documentation/
|   `-- pdfs/
`-- README.md
```

## Regles

- pas de fusion de fichiers entre projets
- pas de mutualisation de dependances dans ce depot
- pas de configuration globale unique entre stacks differentes
- chaque projet conserve sa propre logique d'installation
- chaque projet est reference comme submodule Git

## Separation technique

- `AuditFlow.API` : application principale avec frontend et backend
- `RiskAdviserCn` : service Python dedie aux risques
- `Knowledge_API` : service Python dedie aux connaissances
- `Verification-API` : service Python dedie au programme de verification

## Documentation

Les PDF techniques et de configuration sont stockes a part dans :

- `documentation/pdfs/`
