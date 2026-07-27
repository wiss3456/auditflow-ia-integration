using AuditFlow.Api.Enums;

namespace AuditFlow.Api.Entities;

public sealed class RiskEntry : BaseEntity
{
    public Guid MissionId { get; set; }
    public Mission Mission { get; set; } = default!;
    public string RequestId { get; set; } = string.Empty;
    public string ObjetAuditable { get; set; } = string.Empty;
    public string SousObjetAuditable { get; set; } = string.Empty;
    public string ObjectifOperationnelControle { get; set; } = string.Empty;
    public string Risque { get; set; } = string.Empty;
    public string BonnePratique { get; set; } = string.Empty;
    public string Likelihood { get; set; } = string.Empty;
    public string Impact { get; set; } = string.Empty;
    public string Evaluation { get; set; } = string.Empty;
    public string TypeControle { get; set; } = string.Empty;
    public RiskDecisionStatus DecisionStatus { get; set; } = RiskDecisionStatus.Brouillon;
}