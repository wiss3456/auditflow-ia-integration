namespace AuditFlow.Api.DTOs.Risks;

public sealed class RiskEntryResponseDto
{
    public Guid Id { get; set; }
    public string ObjetAuditable { get; set; } = string.Empty;
    public string SousObjetAuditable { get; set; } = string.Empty;
    public string Risque { get; set; } = string.Empty;
    public string BonnePratique { get; set; } = string.Empty;
    public string Evaluation { get; set; } = string.Empty;
    public string DecisionStatus { get; set; } = string.Empty;
    public string ObjectifOperationnelControle { get; set; } = string.Empty;
}