namespace AuditFlow.Api.DTOs.Auth;

public sealed class UserResponseDto
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public bool IsDisabled { get; set; }
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public string StatusLabel { get; set; } = string.Empty;
    public string Team { get; set; } = string.Empty;
}
