using AuditFlow.Api.DTOs.Auth;
using AuditFlow.Api.DTOs.Users;
using AuditFlow.Api.Enums;

namespace AuditFlow.Api.Services.Interfaces;

public interface IUserService
{
    Task<bool> CanManagePersonnelAsync(Guid userId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<UserResponseDto> SetDisabledAsync(Guid userId, bool isDisabled, CancellationToken cancellationToken = default);
    Task<UserResponseDto> UpdateCurrentUserProfileAsync(Guid userId, UserRole currentUserRole, UpdateCurrentUserProfileRequestDto request, CancellationToken cancellationToken = default);
    Task UpdatePasswordAsync(Guid userId, string password, CancellationToken cancellationToken = default);
}
