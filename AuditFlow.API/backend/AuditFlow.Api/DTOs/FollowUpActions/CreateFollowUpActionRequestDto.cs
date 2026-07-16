using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.FollowUpActions;

public sealed class CreateFollowUpActionRequestDto
{
    [MaxLength(4000)]
    public string? ActionDetail { get; set; }

    public Guid? AssignedUserId { get; set; }

    [MaxLength(50)]
    public string? BoardStatus { get; set; }

    [MaxLength(120)]
    public string? DeadlineLabel { get; set; }

    [MaxLength(4000)]
    public string? Description { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [MaxLength(40)]
    public string? Evaluation { get; set; }

    [Required]
    public Guid MissionId { get; set; }

    [MaxLength(200)]
    public string? OwnerDisplayName { get; set; }

    [MaxLength(4000)]
    public string? Recommendation { get; set; }

    [MaxLength(50)]
    public string? RecommendationNumber { get; set; }

    [MaxLength(50)]
    public string? RecommendationStatus { get; set; }

    [MaxLength(4000)]
    public string? Remarks { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
}
