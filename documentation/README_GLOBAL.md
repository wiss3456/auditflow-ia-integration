# README global

## Objectif

`auditflow-doc` est un repository agregateur.
Son role est de centraliser plusieurs projets lies a AuditFlow tout en conservant une separation stricte entre eux.

Les projets sont integres comme submodules Git.

## Projets inclus

### 1. `AuditFlow.API/`

Source :

- `https://github.com/rimdiab/AuditFlow.API.git`

Contient le frontend et le backend du projet principal.

### 2. `RiskAdviserCn/`

Source :

- `https://github.com/NadaBens/RiskAdviserCn.git`

Contient le service de generation de risques.

### 3. `Knowledge_API/`

Source :

- `https://github.com/YassineSdk/Knowledge_API.git`

Contient le service de generation de dossier de connaissances.

### 4. `Verification-API/`

Source :

- `https://github.com/mouddenhamza62-coder/Verification-API.git`

Contient le service de generation de programme de verification.

## Documentation PDF

Les documents PDF sont ranges dans :

- `documentation/pdfs/`

Fichiers ajoutes :

- `FastAPI_Test_Environment_Configuration.pdf`
- `FastAPI_Test_Environment_Configuration_v3-1.pdf`
- `RiskAdvisor_API2_Config (1).pdf`

## Regle d'organisation

Ce repository ne fusionne pas les codes.
Chaque projet reste dans son propre dossier avec sa propre structure interne et son historique Git d'origine.

## Structure generale

```text
auditflow-doc/
|-- AuditFlow.API/
|-- RiskAdviserCn/
|-- Knowledge_API/
|-- Verification-API/
|-- documentation/
|   `-- pdfs/
|-- .gitignore
`-- README.md
```

## Recuperation

Commande recommandee :

```bash
git clone --recurse-submodules https://github.com/rimdiab/auditFlow-doc.git
```
