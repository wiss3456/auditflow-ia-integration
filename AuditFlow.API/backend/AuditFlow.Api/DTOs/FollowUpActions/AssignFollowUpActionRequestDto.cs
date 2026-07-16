using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.FollowUpActions;

public sealed class AssignFollowUpActionRequestDto
{
    [Required]
    public Guid AssignedUserId { get; set; }
}
