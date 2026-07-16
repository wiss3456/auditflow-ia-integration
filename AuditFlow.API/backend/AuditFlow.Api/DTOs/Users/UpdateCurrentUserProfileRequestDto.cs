using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.Users;

public sealed class UpdateCurrentUserProfileRequestDto
{
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? Phone { get; set; }

    [MaxLength(80)]
    public string? StatusLabel { get; set; }

    [MaxLength(10)]
    public string? Team { get; set; }
}
