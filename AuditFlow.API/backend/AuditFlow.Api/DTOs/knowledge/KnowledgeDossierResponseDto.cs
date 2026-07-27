namespace AuditFlow.Api.DTOs.Knowledge;

public sealed class KnowledgeDossierResponseDto
{
    public Guid Id { get; set; }
    public string DimensionKey { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public List<KnowledgeArticleDto> Articles { get; set; } = new();
}