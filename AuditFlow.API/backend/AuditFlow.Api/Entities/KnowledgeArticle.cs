namespace AuditFlow.Api.Entities;
public sealed class KnowledgeArticle : BaseEntity
{
    public Guid KnowledgeDossierId { get; set; }
    public KnowledgeDossier KnowledgeDossier { get; set; } = default!;
    public string ArticleId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string CitationsJson { get; set; } = "[]";
}