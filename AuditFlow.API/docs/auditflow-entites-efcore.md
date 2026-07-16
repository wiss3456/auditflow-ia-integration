# Structure complete des entites AuditFlow pour C# / .NET / Entity Framework

Ce document synthétise les vraies entités métiers visibles dans l'application actuelle,
en partant du front existant, du stockage partagé et du schéma DBML déjà généré.

Objectif :
- créer les classes métier côté C# avant la mise en place des relations PostgreSQL ;
- disposer d'une base propre pour Entity Framework Core ;
- éviter de confondre les entités persistantes avec les simples états UI temporaires.

## 1. Enums recommandés

```csharp
public enum AppLanguage
{
    Fr = 1,
    En = 2
}

public enum MissionStatus
{
    Planning = 1,
    Fieldwork = 2,
    Review = 3,
    FollowUp = 4,
    Closed = 5
}

public enum MissionPriority
{
    Low = 1,
    Medium = 2,
    High = 3
}

public enum FollowUpStatus
{
    NotDue = 1,
    Planning = 2,
    InProgress = 3,
    AtRisk = 4,
    Completed = 5
}

public enum FollowUpEvaluation
{
    Mineur = 1,
    Modere = 2,
    Critique = 3
}

public enum RecommendationStatus
{
    InStudy = 1,
    Accepted = 2,
    NotAccepted = 3
}

public enum StudyTabKey
{
    Knowledge = 1,
    RiskListing = 2,
    TariFinal = 3,
    AuditPlanning = 4,
    OrientationReport = 5
}

public enum RiskImpact
{
    Low = 1,
    Medium = 2,
    High = 3
}

public enum RiskPriority
{
    Medium = 1,
    High = 2,
    Critical = 3
}

public enum FinalRiskAssessment
{
    Mineure = 1,
    Moderee = 2,
    Critique = 3
}

public enum RiskDecisionStatus
{
    Brouillon = 1,
    Accepte = 2,
    Refuse = 3
}

public enum OrientationUrgency
{
    Faible = 1,
    Moyenne = 2,
    Elevee = 3
}

public enum TestStatus
{
    Ouvert = 1,
    EnCours = 2,
    Cloture = 3
}

public enum AccessRequestStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

public enum PasswordRecoveryStatus
{
    Pending = 1,
    Completed = 2,
    Expired = 3
}
```

## 2. Base abstraite commune

```csharp
public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

Tu peux aussi séparer :
- `BaseEntity<TKey>`
- `AuditableEntity`
- `SoftDeleteEntity`

si tu veux un design plus propre.

## 3. Entites principales

### 3.1 Workspace

Le front travaille aujourd’hui comme un seul workspace ONCF. Côté backend, garde quand même cette entité : elle t’évitera de bloquer l’architecture plus tard.

```csharp
public class Workspace : BaseEntity
{
    public Guid Id { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public AppLanguage ActiveLanguage { get; set; } = AppLanguage.Fr;
    public int Version { get; set; } = 1;

    public ICollection<UserAccount> Users { get; set; } = new List<UserAccount>();
    public ICollection<AppNotification> Notifications { get; set; } = new List<AppNotification>();
    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    public ICollection<StudyPhaseTab> StudyPhaseTabs { get; set; } = new List<StudyPhaseTab>();
    public ICollection<ReportGenerationDraft> ReportGenerationDrafts { get; set; } = new List<ReportGenerationDraft>();
}
```

### 3.2 UserAccount

Cette entité regroupe les comptes créés, les comptes seedés et les profils métier.

```csharp
public class UserAccount : BaseEntity
{
    public string Id { get; set; } = default!; // ex: ONCF-AUD-001
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string Username { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;

    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string FullName { get; set; } = default!;

    public string Role { get; set; } = default!; // Directeur, Chef de département, Chef de mission, Auditeur
    public string Department { get; set; } = default!;
    public string? Team { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDisabled { get; set; } = false;

    public UserProfile? Profile { get; set; }
    public ICollection<AuthSession> Sessions { get; set; } = new List<AuthSession>();
    public ICollection<Mission> CreatedMissions { get; set; } = new List<Mission>();
    public ICollection<Mission> OwnedMissions { get; set; } = new List<Mission>();
    public ICollection<FollowUpAction> OwnedFollowUpActions { get; set; } = new List<FollowUpAction>();
    public ICollection<FollowUpAction> CreatedFollowUpActions { get; set; } = new List<FollowUpAction>();
    public ICollection<StudyPhaseNote> StudyNotes { get; set; } = new List<StudyPhaseNote>();
    public ICollection<StudyPhaseTab> ValidatedStudyTabs { get; set; } = new List<StudyPhaseTab>();
    public ICollection<OrientationReport> ValidatedOrientationReports { get; set; } = new List<OrientationReport>();
    public ICollection<AuditTestProgramItem> AssignedTests { get; set; } = new List<AuditTestProgramItem>();
}
```

### 3.3 UserProfile

À garder séparé si tu veux distinguer le compte d’authentification et le profil éditable.

```csharp
public class UserProfile : BaseEntity
{
    public string UserAccountId { get; set; } = default!;
    public UserAccount UserAccount { get; set; } = default!;

    public string? AvatarUrl { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = default!;
    public string Team { get; set; } = default!;
    public string Timezone { get; set; } = "GMT+1";
}
```

### 3.4 AuthSession

```csharp
public class AuthSession
{
    public Guid Id { get; set; }
    public string UserAccountId { get; set; } = default!;
    public UserAccount UserAccount { get; set; } = default!;

    public string SessionTokenHash { get; set; } = default!;
    public DateTime StartedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
```

### 3.5 AccessRequest

Même si tu as retiré l’UI d’inscription libre, cette classe peut être utile si tu veux garder la logique.

```csharp
public class AccessRequest : BaseEntity
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public bool PasswordSupplied { get; set; }
    public AccessRequestStatus Status { get; set; } = AccessRequestStatus.Pending;

    public string? ReviewedByUserId { get; set; }
    public UserAccount? ReviewedByUser { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
```

### 3.6 PasswordRecoveryRequest

```csharp
public class PasswordRecoveryRequest : BaseEntity
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string? UserAccountId { get; set; }
    public UserAccount? UserAccount { get; set; }

    public string Email { get; set; } = default!;
    public PasswordRecoveryStatus Status { get; set; } = PasswordRecoveryStatus.Pending;
    public DateTime RequestedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
```

### 3.7 AppNotification

```csharp
public class AppNotification
{
    public string Id { get; set; } = default!;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
```

## 4. Missions

### 4.1 MissionTemplate

Optionnel, mais recommandé si tu veux réintroduire des modèles plus tard proprement.

```csharp
public class MissionTemplate : BaseEntity
{
    public string Id { get; set; } = default!;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string? DefaultEntity { get; set; }
    public string? DurationLabel { get; set; }
    public string? RecommendedTeam { get; set; }
    public string? SampleMissionTitle { get; set; }

    public string? FocusAreasJson { get; set; }
    public string? DeliverablesJson { get; set; }
    public string? KickoffChecklistJson { get; set; }
    public string? UseCase { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Mission> Missions { get; set; } = new List<Mission>();
}
```

### 4.2 Mission

```csharp
public class Mission : BaseEntity
{
    public string Id { get; set; } = default!; // ex: ONCF-AI-2026-001
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string? MissionTemplateId { get; set; }
    public MissionTemplate? MissionTemplate { get; set; }

    public string? CreatedByUserId { get; set; }
    public UserAccount? CreatedByUser { get; set; }

    public string? OwnerUserId { get; set; }
    public UserAccount? OwnerUser { get; set; }

    public string OwnerName { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Client { get; set; } = default!;
    public string? Site { get; set; }
    public string Objective { get; set; } = default!;
    public string Scope { get; set; } = default!;
    public string? PhaseLabel { get; set; }
    public MissionStatus Status { get; set; }
    public MissionPriority Priority { get; set; }
    public int Progress { get; set; }
    public DateOnly DueDate { get; set; }
    public int OpenFindings { get; set; }
    public string? NextAction { get; set; }
    public DateTime? ArchivedAt { get; set; }

    public ICollection<MissionAssignment> Assignments { get; set; } = new List<MissionAssignment>();
    public ICollection<FollowUpAction> FollowUpActions { get; set; } = new List<FollowUpAction>();
    public ICollection<StudyPhaseTab> StudyPhaseTabs { get; set; } = new List<StudyPhaseTab>();
    public ICollection<OrientationReport> OrientationReports { get; set; } = new List<OrientationReport>();
}
```

### 4.3 MissionAssignment

Très important : cette entité est préférable au simple “owner” si tu veux réellement gérer l’équipe.

```csharp
public class MissionAssignment : BaseEntity
{
    public Guid Id { get; set; }
    public string MissionId { get; set; } = default!;
    public Mission Mission { get; set; } = default!;

    public string UserAccountId { get; set; } = default!;
    public UserAccount UserAccount { get; set; } = default!;

    public string RoleOnMission { get; set; } = default!; // Responsable, Auditeur, Superviseur...
    public bool IsPrimary { get; set; }
}
```

### 4.4 UserMissionSelection

Dans l’application actuelle, la mission sélectionnée est stockée par utilisateur dans un dictionnaire. En base relationnelle, transforme ça en vraie table.

```csharp
public class UserMissionSelection
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string UserAccountId { get; set; } = default!;
    public UserAccount UserAccount { get; set; } = default!;

    public string MissionId { get; set; } = default!;
    public Mission Mission { get; set; } = default!;

    public DateTime SelectedAt { get; set; }
}
```

## 5. Suivi

### 5.1 FollowUpAction

C’est une entité clé du projet.

```csharp
public class FollowUpAction : BaseEntity
{
    public string Id { get; set; } = default!;
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string? MissionId { get; set; }
    public Mission? Mission { get; set; }

    public string? OwnerUserId { get; set; }
    public UserAccount? OwnerUser { get; set; }

    public string? CreatedByUserId { get; set; }
    public UserAccount? CreatedByUser { get; set; }

    public string? OwnerName { get; set; }
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public string? RecommendationNumber { get; set; }
    public string? Recommendation { get; set; }
    public string ActionDetail { get; set; } = default!;
    public FollowUpEvaluation Evaluation { get; set; }
    public RecommendationStatus RecommendationStatus { get; set; }
    public FollowUpStatus Status { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? DeadlineLabel { get; set; }
    public string? Remarks { get; set; }
}
```

## 6. Phase d’étude

### 6.1 StudyPhaseTab

```csharp
public class StudyPhaseTab : BaseEntity
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string? MissionId { get; set; }
    public Mission? Mission { get; set; }

    public StudyTabKey TabKey { get; set; }
    public string Label { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsGenerated { get; set; }
    public bool IsValidated { get; set; }
    public DateTime? SavedAt { get; set; }
    public DateTime? ValidatedAt { get; set; }

    public string? ValidatedByUserId { get; set; }
    public UserAccount? ValidatedByUser { get; set; }

    public ICollection<StudyKnowledgeCard> KnowledgeCards { get; set; } = new List<StudyKnowledgeCard>();
    public ICollection<StudyDocument> Documents { get; set; } = new List<StudyDocument>();
    public ICollection<StudyNote> Notes { get; set; } = new List<StudyNote>();
    public ICollection<RiskRegisterItem> RiskRegisterItems { get; set; } = new List<RiskRegisterItem>();
    public ICollection<TariFinalItem> TariFinalItems { get; set; } = new List<TariFinalItem>();
    public ICollection<AuditTestProgramItem> AuditTestProgramItems { get; set; } = new List<AuditTestProgramItem>();
}
```

### 6.2 StudyKnowledgeCard

```csharp
public class StudyKnowledgeCard
{
    public string Id { get; set; } = default!;
    public Guid StudyPhaseTabId { get; set; }
    public StudyPhaseTab StudyPhaseTab { get; set; } = default!;

    public string? Category { get; set; }
    public string Title { get; set; } = default!;
    public string? Summary { get; set; }
    public string? Detail { get; set; }
    public bool IsAiGenerated { get; set; } = true;
    public int DisplayOrder { get; set; }
}
```

### 6.3 StudyDocument

```csharp
public class StudyDocument
{
    public string Id { get; set; } = default!;
    public Guid StudyPhaseTabId { get; set; }
    public StudyPhaseTab StudyPhaseTab { get; set; } = default!;

    public string FileName { get; set; } = default!;
    public long? FileSizeBytes { get; set; }
    public DateTime AddedAt { get; set; }
}
```

### 6.4 StudyNote

```csharp
public class StudyNote
{
    public string Id { get; set; } = default!;
    public Guid StudyPhaseTabId { get; set; }
    public StudyPhaseTab StudyPhaseTab { get; set; } = default!;

    public string? AuthorUserId { get; set; }
    public UserAccount? AuthorUser { get; set; }
    public string AuthorName { get; set; } = default!;
    public string Content { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
```

### 6.5 RiskRegisterItem

Correspond à `Listing des risques`.

```csharp
public class RiskRegisterItem : BaseEntity
{
    public string Id { get; set; } = default!;
    public Guid StudyPhaseTabId { get; set; }
    public StudyPhaseTab StudyPhaseTab { get; set; } = default!;

    public string Code { get; set; } = default!;
    public string? AuditableObject { get; set; }
    public string? AuditableSubObject { get; set; }
    public string RiskTitle { get; set; } = default!;
    public string? OperationalControlObjective { get; set; }
    public FinalRiskAssessment RiskAssessment { get; set; }
    public RiskImpact Impact { get; set; }
    public short Probability { get; set; }
    public RiskPriority Priority { get; set; }
    public string? GoodPractices { get; set; }
    public RiskDecisionStatus DecisionStatus { get; set; } = RiskDecisionStatus.Brouillon;
    public int SortOrder { get; set; }
}
```

### 6.6 TariFinalItem

Correspond à `TaRi final`.

```csharp
public class TariFinalItem : BaseEntity
{
    public string Id { get; set; } = default!;
    public Guid StudyPhaseTabId { get; set; }
    public StudyPhaseTab StudyPhaseTab { get; set; } = default!;

    public string Code { get; set; } = default!;
    public string? AuditableObject { get; set; }
    public string? AuditableSubObject { get; set; }
    public string RiskTitle { get; set; } = default!;
    public string? OperationalControlObjective { get; set; }
    public FinalRiskAssessment RiskAssessment { get; set; }
    public RiskImpact Impact { get; set; }
    public short Probability { get; set; }
    public string? GoodPractices { get; set; }
    public int SortOrder { get; set; }
}
```

### 6.7 AuditTestProgramItem

Correspond à `Planification & Tests`.

```csharp
public class AuditTestProgramItem : BaseEntity
{
    public string Id { get; set; } = default!;
    public Guid StudyPhaseTabId { get; set; }
    public StudyPhaseTab StudyPhaseTab { get; set; } = default!;

    public string TestNumber { get; set; } = default!;
    public string Task { get; set; } = default!;
    public string? Objective { get; set; }
    public string? Methodology { get; set; }

    public string? AuditorUserId { get; set; }
    public UserAccount? AuditorUser { get; set; }
    public string? AuditorName { get; set; }

    public TestStatus Status { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Comments { get; set; }
    public string? ActionLabel { get; set; }
    public bool IsNonConformity { get; set; }
    public int SortOrder { get; set; }
}
```

## 7. Rapport d’orientation dans la phase d’étude

### 7.1 OrientationReport

```csharp
public class OrientationReport : BaseEntity
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string? MissionId { get; set; }
    public Mission? Mission { get; set; }

    public Guid? StudyPhaseTabId { get; set; }
    public StudyPhaseTab? StudyPhaseTab { get; set; }

    public string? MissionLabel { get; set; }
    public string? MissionReference { get; set; }
    public string? WriterName { get; set; }
    public string? VersionLabel { get; set; }
    public DateOnly? ReportDate { get; set; }
    public DateOnly? StartedAt { get; set; }
    public string? Entity { get; set; }
    public OrientationUrgency? Urgency { get; set; }
    public string? ScopeJson { get; set; }
    public string? Objective { get; set; }
    public string? Metrics { get; set; }
    public string? Characteristics { get; set; }
    public string? ExpectedBenefits { get; set; }
    public string? AuditeeConcerns { get; set; }
    public string? Exclusions { get; set; }
    public string? MissionLeadName { get; set; }
    public string? MissionSupervisorName { get; set; }
    public bool IsValidated { get; set; }
    public DateTime? SavedAt { get; set; }
    public DateTime? ValidatedAt { get; set; }

    public string? ValidatedByUserId { get; set; }
    public UserAccount? ValidatedByUser { get; set; }

    public ICollection<OrientationReportObjective> Objectives { get; set; } = new List<OrientationReportObjective>();
}
```

### 7.2 OrientationReportObjective

```csharp
public class OrientationReportObjective
{
    public string Id { get; set; } = default!;
    public Guid OrientationReportId { get; set; }
    public OrientationReport OrientationReport { get; set; } = default!;

    public string? Domain { get; set; }
    public string Objective { get; set; } = default!;
    public string? ControlCriteria { get; set; }
    public string? AssociatedRisk { get; set; }
    public int SortOrder { get; set; }
}
```

## 8. Génération de rapport hors phase d’étude

Cette partie existe dans l’application actuelle sous forme d’état spécifique de page.
Pour le backend, je te recommande de la stocker sous forme de **draft** ou **configuration de génération**.

### 8.1 ReportGenerationDraft

```csharp
public class ReportGenerationDraft : BaseEntity
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = default!;

    public string CreatedByUserId { get; set; } = default!;
    public UserAccount CreatedByUser { get; set; } = default!;

    public string ReportDescription { get; set; } = default!;
    public string RecommendationComment { get; set; } = default!;
    public string ActionComment { get; set; } = default!;
    public string FooterText { get; set; } = default!;

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public DateTime? GeneratedAt { get; set; }
    public DateTime? SavedAt { get; set; }

    public ICollection<ReportGenerationDraftMission> Missions { get; set; } = new List<ReportGenerationDraftMission>();
}
```

### 8.2 ReportGenerationDraftMission

```csharp
public class ReportGenerationDraftMission
{
    public Guid Id { get; set; }
    public Guid ReportGenerationDraftId { get; set; }
    public ReportGenerationDraft ReportGenerationDraft { get; set; } = default!;

    public string MissionId { get; set; } = default!;
    public Mission Mission { get; set; } = default!;
}
```

## 9. Paramètres de notifications

Le front a aussi une configuration de notifications en local. Si tu veux la persister proprement :

```csharp
public class NotificationPreference : BaseEntity
{
    public Guid Id { get; set; }
    public string UserAccountId { get; set; } = default!;
    public UserAccount UserAccount { get; set; } = default!;

    public bool EmailNotificationsEnabled { get; set; }
    public bool BrowserNotificationsEnabled { get; set; }
    public bool WeeklySummaryEnabled { get; set; }
    public bool FollowUpAlertsEnabled { get; set; }
}
```

## 10. Ordre recommandé de création des classes

Pour Visual Studio / EF Core, crée-les dans cet ordre :

1. `Enums`
2. `BaseEntity`
3. `Workspace`
4. `UserAccount`
5. `UserProfile`
6. `AuthSession`
7. `AppNotification`
8. `MissionTemplate`
9. `Mission`
10. `MissionAssignment`
11. `UserMissionSelection`
12. `FollowUpAction`
13. `StudyPhaseTab`
14. `StudyKnowledgeCard`
15. `StudyDocument`
16. `StudyNote`
17. `RiskRegisterItem`
18. `TariFinalItem`
19. `AuditTestProgramItem`
20. `OrientationReport`
21. `OrientationReportObjective`
22. `ReportGenerationDraft`
23. `ReportGenerationDraftMission`
24. `AccessRequest`
25. `PasswordRecoveryRequest`
26. `NotificationPreference`

## 11. Relations principales à prévoir ensuite

Quand tu passeras aux relations EF :

- `Workspace 1 -> n UserAccount`
- `Workspace 1 -> n Mission`
- `Mission 1 -> n MissionAssignment`
- `Mission 1 -> n FollowUpAction`
- `Mission 1 -> n StudyPhaseTab`
- `StudyPhaseTab 1 -> n StudyKnowledgeCard`
- `StudyPhaseTab 1 -> n StudyDocument`
- `StudyPhaseTab 1 -> n StudyNote`
- `StudyPhaseTab 1 -> n RiskRegisterItem`
- `StudyPhaseTab 1 -> n TariFinalItem`
- `StudyPhaseTab 1 -> n AuditTestProgramItem`
- `OrientationReport 1 -> n OrientationReportObjective`
- `UserAccount 1 -> 1 UserProfile`
- `UserAccount 1 -> n AuthSession`
- `UserAccount 1 -> n MissionAssignment`
- `UserAccount 1 -> n FollowUpAction`

## 12. Ce qui est métier et ce qui ne l’est pas

À ne **pas** transformer en tables :
- les composants visuels MUI
- les props React
- les états purement UI comme `isDialogOpen`, `selectedCardId`, `fullscreen`
- les cartes KPI calculées à la volée

À transformer en entités si tu veux une vraie application robuste :
- comptes
- profils
- missions
- équipe de mission
- actions de suivi
- recommandations
- contenus de la phase d’étude
- planification des tests
- rapport d’orientation
- brouillons de génération de rapport

## 13. Recommandation technique EF Core

Je te conseille côté .NET :

- projet `AuditFlow.Domain`
- projet `AuditFlow.Infrastructure`
- projet `AuditFlow.Api`

Et dans `Infrastructure` :
- `AuditFlowDbContext`
- configurations Fluent API par entité :
  - `MissionConfiguration`
  - `FollowUpActionConfiguration`
  - `UserAccountConfiguration`
  - etc.

Cela sera plus propre que de tout mettre dans les annotations.
