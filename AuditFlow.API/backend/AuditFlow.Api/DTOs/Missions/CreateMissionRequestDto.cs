using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.Missions;

public sealed class CreateMissionRequestDto
{
    [Required]
    [MaxLength(150)]
    public string Client { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    public DateOnly DueDate { get; set; }

    [MaxLength(2000)]
    public string? Objective { get; set; }

    public Guid? OwnerUserId { get; set; }

    [Required]
    [MaxLength(80)]
    public string Reference { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Scope { get; set; }

    [MaxLength(150)]
    public string? Site { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
}
