namespace AuditFlow.Api.DTOs.Verification;

public sealed class VerificationTestResponseDto
{
    public Guid Id { get; set; }
    public string TestNumber { get; set; } = string.Empty;
    public string Tache { get; set; } = string.Empty;
    public string Objectif { get; set; } = string.Empty;
    public string Methodologie { get; set; } = string.Empty;
    public string Auditor { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
    public string Comments { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public bool IsNonConformity { get; set; }
}