using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.Verification;

public sealed class CreateVerificationTestRequestDto
{
    public Guid? RiskEntryId { get; set; }
    [Required] public string Tache { get; set; } = string.Empty;
    public string Objectif { get; set; } = string.Empty;
    public string Methodologie { get; set; } = string.Empty;
}