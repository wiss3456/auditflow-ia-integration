using System.ComponentModel.DataAnnotations;

namespace AuditFlow.Api.DTOs.Users;

public sealed class UpdateCurrentUserPasswordRequestDto
{
    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}
