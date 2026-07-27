using System.Text.Json.Serialization;

namespace AuditFlow.Api.Services.Models;

public sealed class KnowledgeApiRawResponse
{
    [JsonPropertyName("status")] public string Status { get; set; } = string.Empty;
    [JsonPropertyName("mission_id")] public string MissionId { get; set; } = string.Empty;
    [JsonPropertyName("knowledge_dossier")] public Dictionary<string, KnowledgeDossierRaw> KnowledgeDossier { get; set; } = new();
    [JsonPropertyName("generated_at")] public string? GeneratedAt { get; set; }
}

public sealed class KnowledgeDossierRaw
{
    [JsonPropertyName("summary")] public string Summary { get; set; } = string.Empty;
    [JsonPropertyName("articles")] public List<KnowledgeArticleRaw> Articles { get; set; } = new();
}

public sealed class KnowledgeArticleRaw
{
    [JsonPropertyName("article_id")] public string ArticleId { get; set; } = string.Empty;
    [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
    [JsonPropertyName("content")] public string Content { get; set; } = string.Empty;
    [JsonPropertyName("citations")] public List<string> Citations { get; set; } = new();
}