using AuditFlow.Api.Enums;

namespace AuditFlow.Api.Entities;

public sealed class FollowUpAction : BaseEntity
{
    public string? ActionDetail { get; set; }
    public Guid? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
    public FollowUpActionBoardStatus BoardStatus { get; set; } = FollowUpActionBoardStatus.Planning;
    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = default!;
    public string? DeadlineLabel { get; set; }
    public string? Description { get; set; }
    public DateOnly EndDate { get; set; }
    public FollowUpActionEvaluation Evaluation { get; set; } = FollowUpActionEvaluation.Modere;
    public Guid MissionId { get; set; }
    public Mission Mission { get; set; } = default!;
    public string? OwnerDisplayName { get; set; }
    public string? Recommendation { get; set; }
    public string? RecommendationNumber { get; set; }
    public FollowUpRecommendationStatus RecommendationStatus { get; set; } = FollowUpRecommendationStatus.InStudy;
    public string? Remarks { get; set; }
    public DateOnly StartDate { get; set; }
    public FollowUpActionStatus Status { get; set; } = FollowUpActionStatus.NotStarted;
    public string Title { get; set; } = string.Empty;
}
