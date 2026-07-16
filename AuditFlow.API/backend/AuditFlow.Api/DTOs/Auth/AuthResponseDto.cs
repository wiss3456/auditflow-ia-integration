namespace AuditFlow.Api.DTOs.Auth;

public sealed class AuthResponseDto
{
    public DateTime ExpiresAtUtc { get; set; }
    public string Token { get; set; } = string.Empty;
    public UserResponseDto User { get; set; } = new();
}
