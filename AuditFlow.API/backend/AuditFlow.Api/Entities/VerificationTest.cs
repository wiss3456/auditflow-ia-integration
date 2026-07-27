namespace AuditFlow.Api.Entities;
using AuditFlow.Api.Enums;
public sealed class VerificationTest : BaseEntity
{
    public Guid MissionId { get; set; }
    public Mission Mission { get; set; } = default!;
    public Guid? RiskEntryId { get; set; }
    public RiskEntry? RiskEntry { get; set; }
    public string TestNumber { get; set; } = string.Empty;
    public string Tache { get; set; } = string.Empty;
    public string Objectif { get; set; } = string.Empty;
    public string Methodologie { get; set; } = string.Empty;
    public string Auditor { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public bool IsNonConformity { get; set; }
    public VerificationTestStatus Status { get; set; } = VerificationTestStatus.Ouvert;
    public Guid? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
}