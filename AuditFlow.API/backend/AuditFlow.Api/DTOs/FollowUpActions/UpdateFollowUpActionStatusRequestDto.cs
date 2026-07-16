using System.ComponentModel.DataAnnotations;
using AuditFlow.Api.Enums;

namespace AuditFlow.Api.DTOs.FollowUpActions;

public sealed class UpdateFollowUpActionStatusRequestDto
{
    [Required]
    public FollowUpActionStatus Status { get; set; }
}
