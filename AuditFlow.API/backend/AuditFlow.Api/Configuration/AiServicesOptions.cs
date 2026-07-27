namespace AuditFlow.Api.Configuration;

public sealed class AiServicesOptions
{
    public const string SectionName = "AiServices";
    public string Knowledge { get; set; } = string.Empty;
    public string KnowledgeApiKey { get; set; } = string.Empty;
    public string RiskAdvisor { get; set; } = string.Empty;
    public string Verification { get; set; } = string.Empty;
}