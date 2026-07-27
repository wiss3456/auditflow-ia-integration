using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.Risks;

public sealed class CreateRiskEntryRequestDto
{
    [Required] public string ObjetAuditable { get; set; } = string.Empty;
    [Required] public string SousObjetAuditable { get; set; } = string.Empty;
    public string ObjectifOperationnelControle { get; set; } = string.Empty;
    [Required] public string Risque { get; set; } = string.Empty;
    public string BonnePratique { get; set; } = string.Empty;
    public string Likelihood { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public string Evaluation { get; set; } = string.Empty;
    public string TypeControle { get; set; } = string.Empty;
}