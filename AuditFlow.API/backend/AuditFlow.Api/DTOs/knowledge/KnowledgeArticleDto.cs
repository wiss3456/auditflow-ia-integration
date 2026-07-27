namespace AuditFlow.Api.DTOs.Knowledge;

public sealed class KnowledgeArticleDto
{
    public string ArticleId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public List<string> Citations { get; set; } = new();
}