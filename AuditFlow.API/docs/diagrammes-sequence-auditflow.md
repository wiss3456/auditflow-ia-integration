# Diagrammes de sequence AuditFlow

Ce document decrit les principaux flux visibles dans l'application actuelle.
Les diagrammes sont exprimes en Mermaid pour pouvoir etre visualises dans GitHub
ou dans tout editeur compatible.

## 1. Authentification et ouverture de session

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant UI as Page Authentification
    participant AC as authClient
    participant MU as mock-users
    participant LS as localStorage
    participant UC as UserContext

    U->>UI: Saisit identifiant + mot de passe
    UI->>AC: signInWithPassword(identifier, password)
    AC->>MU: findAuditorAccount(identifier)
    MU-->>AC: Compte correspondant

    alt Mot de passe invalide
        AC-->>UI: "Mot de passe incorrect"
    else Compte desactive
        AC-->>UI: "Ce compte a ete desactive"
    else Connexion valide
        AC->>LS: Enregistre custom-auth-token
        AC->>LS: Enregistre custom-auth-user
        UI->>AC: getUser()
        AC->>LS: Lit session active
        AC->>MU: findAuditorAccountById(userId)
        AC-->>UI: Utilisateur fusionne avec profil stocke
        UI->>UC: Met a jour currentUser
        UI-->>U: Ouvre le panneau des missions visibles
    end
```

## 2. Selection d'une mission apres connexion

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant UI as Panneau missions apres connexion
    participant WA as Workspace
    participant LS as localStorage
    participant OV as Vue d'ensemble
    participant NAV as MainNav

    U->>UI: Clique sur une mission
    UI->>WA: saveWorkspaceSelectedMission(userId, missionId)
    WA->>LS: Met a jour auditflow-workspace-state-oncf
    UI->>OV: Redirection vers /dashboard
    OV->>WA: Lit la mission selectionnee du currentUser
    NAV->>WA: Lit la mission selectionnee du currentUser
    NAV-->>U: Affiche le badge "Mission selectionnee"
```

## 3. Consultation rapide et selection officielle d'une mission

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant DB as Vue d'ensemble
    participant MD as Detail mission
    participant WA as Workspace
    participant NAV as MainNav

    alt Consultation rapide
        U->>DB: Clique sur l'icone oeil
        DB->>MD: Ouvre le detail mission
        MD-->>U: Affiche les details sans selection
    else Selection officielle
        U->>DB: Clique sur l'icone fleche
        DB->>WA: saveWorkspaceSelectedMission(userId, missionId)
        WA-->>DB: Etat partage mis a jour
        NAV->>WA: Recharge la mission active
        NAV-->>U: Badge mis a jour automatiquement
    end
```

## 4. Creation d'une mission

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant NM as Nouvelle mission
    participant WA as Workspace
    participant LS as localStorage
    participant MIS as Liste des missions
    participant DB as Vue d'ensemble

    U->>NM: Remplit le formulaire mission
    U->>NM: Clique sur Enregistrer
    NM->>WA: saveWorkspaceMission(mission)
    WA->>LS: Met a jour missions + archives + etat partage
    WA-->>MIS: Les listes se resynchronisent
    WA-->>DB: Le registre des missions se met a jour
    MIS-->>U: La mission devient visible
```

## 5. Phase d'etude - edition et sauvegarde

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant EP as Phase d'etude
    participant WA as Workspace
    participant LS as localStorage

    U->>EP: Modifie risques / TaRi / planification
    U->>EP: Clique sur Enregistrer ou Valider
    EP->>WA: saveWorkspaceStudyPhaseState(state)
    WA->>LS: Met a jour studyPhaseState
    WA-->>EP: Etat recharge dans l'interface
    EP-->>U: Donnees coherentes sur les autres vues liees
```

## 6. Suivi - creation d'une recommandation

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant FU as Page Suivi
    participant WA as Workspace
    participant LS as localStorage
    participant DG as Diagrammes et cartes

    U->>FU: Ouvre "Nouvelle recommandation"
    U->>FU: Renseigne les champs
    U->>FU: Clique sur Ajouter
    FU->>WA: updateWorkspaceState(followUpActions)
    WA->>LS: Sauvegarde followUpActions
    WA-->>FU: Colonnes Recommandations / Actions rechargees
    DG->>WA: Recalcule statuts, compteurs, graphiques
    DG-->>U: Affichage mis a jour automatiquement
```

## 7. Suivi - glisser/deposer d'une recommandation ou d'une action

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant FU as Kanban Suivi
    participant WA as Workspace
    participant LS as localStorage
    participant DG as Diagrammes

    U->>FU: Glisse un element vers une autre colonne
    FU->>WA: updateWorkspaceState(status/recommendationStatus)
    WA->>LS: Persiste l'etat modifie
    WA-->>FU: Recharge la colonne cible
    DG->>WA: Recalcule les valeurs dynamiques
    DG-->>U: Statistiques et diagrammes mis a jour
```

## 8. Gestion du personnel - creation d'un compte

```mermaid
sequenceDiagram
    autonumber
    actor M as Directeur ou Chef de departement
    participant SM as Gestion du personnel
    participant MU as mock-users
    participant LS as localStorage
    participant AU as Utilisateur cree

    M->>SM: Ouvre le formulaire de creation
    M->>SM: Saisit nom, prenom, email, role, equipe
    SM->>MU: createGeneratedAuditorPassword()
    SM->>MU: createAuditorAccount(input)
    MU->>LS: Enregistre auditflow-custom-auditor-accounts
    MU-->>SM: Retourne le compte cree
    SM-->>M: Affiche email + mot de passe genere
    M->>SM: Copie les identifiants
    AU-->>AU: Se connecte ensuite avec son propre compte
```

## 9. Profil utilisateur

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant PF as Page Profil
    participant PS as profile-storage
    participant LS as localStorage
    participant UC as UserContext

    U->>PF: Modifie photo / nom / prenom / equipe / mot de passe
    PF->>PS: saveStoredProfile(profile, currentUser)
    PS->>LS: Met a jour auditflow-profile:<userId>
    PS-->>UC: Emet PROFILE_UPDATED_EVENT
    UC->>UC: Recharge le profil du currentUser
    UC-->>PF: Interface resynchronisee pour l'utilisateur actif
```

## 10. Generation de rapport

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant RP as Page Rapport
    participant WA as Workspace
    participant LS as localStorage
    participant PV as Apercu rapport

    U->>RP: Selectionne missions + periode
    U->>RP: Ajoute les commentaires de rapport
    U->>RP: Clique sur Generer le rapport
    RP->>WA: Lit missions + followUpActions + etats associes
    RP->>LS: Sauvegarde orientationReportState
    RP-->>PV: Construit l'aperçu dynamique
    PV-->>U: Affiche le rapport avant export PDF/Excel
```

## 11. Detail mission et equipe

```mermaid
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant MD as Detail mission
    participant WA as Workspace
    participant TM as mission-team
    participant MU as mock-users
    participant PS as profile-storage

    U->>MD: Ouvre une mission
    MD->>WA: Charge la mission par missionId
    MD->>TM: getMissionTeamMembers(mission)
    TM->>MU: Charge les comptes disponibles
    TM->>PS: Charge les profils des membres
    TM-->>MD: Retourne photo ou initiales + noms
    MD-->>U: Affiche l'equipe de mission
```

## 12. Synchronisation transversale des donnees

```mermaid
sequenceDiagram
    autonumber
    participant UI as Interface
    participant WA as Workspace
    participant LS as localStorage
    participant HW as useWorkspace hook
    participant Pages as Pages consommatrices

    UI->>WA: updateWorkspaceState(...)
    WA->>LS: Ecrit auditflow-workspace-state-oncf
    WA->>HW: Emet WORKSPACE_UPDATED_EVENT
    HW->>Pages: Recharge workspace en memoire
    Pages-->>UI: Affichage coherent entre dashboard, etude, suivi, missions
```

## Remarque importante

L'application actuelle fonctionne majoritairement sur un stockage `localStorage`
partage dans le navigateur. Les diagrammes ci-dessus decrivent donc le
fonctionnement reel actuel du projet visible, et non une architecture backend
de production avec une base de donnees centralisee.
