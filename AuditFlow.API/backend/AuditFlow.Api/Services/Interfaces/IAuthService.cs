using AuditFlow.Api.DTOs.Auth;
using AuditFlow.Api.Enums;

namespace AuditFlow.Api.Services.Interfaces;

public interface IAuthService
{
    Task<bool> HasAnyUsersAsync(CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<UserResponseDto> MeAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, Guid? currentUserId, CancellationToken cancellationToken = default);
}
