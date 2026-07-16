using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.FollowUpActions;

public sealed class UpdateFollowUpActionRecommendationStatusRequestDto
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;
}
