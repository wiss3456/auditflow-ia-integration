using System.Text.Json.Serialization;

namespace AuditFlow.Api.Services.Models;

public sealed class GenRisksResponse
{
    [JsonPropertyName("request_id")] public string RequestId { get; set; } = string.Empty;
}

public sealed class RiskAdvisorRawOutput
{
    [JsonPropertyName("tari_table")] public List<ObjetAuditableRaw> TariTable { get; set; } = new();
}

public sealed class ObjetAuditableRaw
{
    [JsonPropertyName("objet_auditable")] public string ObjetAuditable { get; set; } = string.Empty;
    [JsonPropertyName("sous_objets")] public List<SousObjetRaw> SousObjets { get; set; } = new();
}

public sealed class SousObjetRaw
{
    [JsonPropertyName("sous_objet_auditable")] public string SousObjetAuditable { get; set; } = string.Empty;
    [JsonPropertyName("risques")] public List<RisqueRaw> Risques { get; set; } = new();
}

public sealed class RisqueRaw
{
    [JsonPropertyName("risque")] public string Risque { get; set; } = string.Empty;
    [JsonPropertyName("objectif_operationnel_controle")] public string? ObjectifOperationnelControle { get; set; }
    [JsonPropertyName("bonne_pratique")] public string BonnePratique { get; set; } = string.Empty;
    [JsonPropertyName("likelihood")] public string Likelihood { get; set; } = string.Empty;
    [JsonPropertyName("impact")] public string Impact { get; set; } = string.Empty;
    [JsonPropertyName("evaluation")] public string Evaluation { get; set; } = string.Empty;
    [JsonPropertyName("type_controle")] public string TypeControle { get; set; } = string.Empty;
}