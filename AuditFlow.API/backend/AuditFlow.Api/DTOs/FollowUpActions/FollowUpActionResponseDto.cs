namespace AuditFlow.Api.DTOs.FollowUpActions;

public sealed class FollowUpActionResponseDto
{
    public string? ActionDetail { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string? AssignedUserName { get; set; }
    public string BoardStatus { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public string CreatedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public string? DeadlineLabel { get; set; }
    public string? Description { get; set; }
    public DateOnly EndDate { get; set; }
    public string Evaluation { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public Guid MissionId { get; set; }
    public string? OwnerDisplayName { get; set; }
    public string? Recommendation { get; set; }
    public string? RecommendationNumber { get; set; }
    public string RecommendationStatus { get; set; } = string.Empty;
    public string? Remarks { get; set; }
    public DateOnly StartDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime UpdatedAtUtc { get; set; }
}
