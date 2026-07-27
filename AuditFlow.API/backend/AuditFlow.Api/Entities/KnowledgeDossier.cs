namespace AuditFlow.Api.Entities;

public sealed class KnowledgeDossier : BaseEntity
{
    public Guid MissionId { get; set; }
    public Mission Mission { get; set; } = default!;
    public string DimensionKey { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string ContentHash { get; set; } = string.Empty;
    public DateTime LastGeneratedAt { get; set; }
    public ICollection<KnowledgeArticle> Articles { get; set; } = new List<KnowledgeArticle>();
}