namespace AuditFlow.Api.DTOs.Missions;

public sealed class MissionResponseDto
{
    public string Client { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public string? Description { get; set; }
    public DateOnly DueDate { get; set; }
    public int FollowUpActionCount { get; set; }
    public Guid Id { get; set; }
    public string? Objective { get; set; }
    public Guid? OwnerUserId { get; set; }
    public string? OwnerUserName { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string? Scope { get; set; }
    public string? Site { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime UpdatedAtUtc { get; set; }
}
