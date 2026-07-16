using System.ComponentModel.DataAnnotations;
using AuditFlow.Api.Enums;

namespace AuditFlow.Api.DTOs.Auth;

public sealed class RegisterRequestDto
{
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? Phone { get; set; }

    public UserRole Role { get; set; } = UserRole.Auditor;

    [MaxLength(80)]
    public string? StatusLabel { get; set; }

    [MaxLength(10)]
    public string? Team { get; set; }
}
