using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.Knowledge;

public sealed class CreateKnowledgeDossierRequestDto
{
    [Required] public string DimensionKey { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public List<KnowledgeArticleDto> Articles { get; set; } = new();
}