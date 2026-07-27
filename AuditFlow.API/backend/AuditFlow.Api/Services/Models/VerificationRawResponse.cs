using System.Text.Json.Serialization;

namespace AuditFlow.Api.Services.Models;

public sealed class GenerateVerificationResponse
{
    [JsonPropertyName("request_id")] public string RequestId { get; set; } = string.Empty;
}

public sealed class VerificationTaskRaw
{
    [JsonPropertyName("tache")] public string Tache { get; set; } = string.Empty;
    [JsonPropertyName("objectif")] public string Objectif { get; set; } = string.Empty;
    [JsonPropertyName("methodologie")] public string Methodologie { get; set; } = string.Empty;
    [JsonPropertyName("risque")] public string Risque { get; set; } = string.Empty;
    [JsonPropertyName("mission_id")] public string MissionId { get; set; } = string.Empty;
}