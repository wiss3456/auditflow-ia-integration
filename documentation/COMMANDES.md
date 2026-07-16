# Commandes utiles

## Cloner le repository agregateur

```powershell
git clone --recurse-submodules https://github.com/rimdiab/auditFlow-doc.git
```

## Initialiser les submodules apres clonage

```powershell
git submodule update --init --recursive
```

## Ouvrir un projet specifique

```powershell
cd AuditFlow.API
cd RiskAdviserCn
cd Knowledge_API
cd Verification-API
```

## Mettre a jour le repository agregateur

```powershell
git status
git add .
git commit -m "Update aggregated project sources"
git push
```
