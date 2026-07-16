using AuditFlow.Api.Common;
using AuditFlow.Api.DTOs.Auth;
using AuditFlow.Api.DTOs.Users;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace AuditFlow.Api.Services.Implementations;

public sealed class UserService(
    IUserRepository userRepository,
    IPasswordHasher<User> passwordHasher) : IUserService
{
    public async Task<bool> CanManagePersonnelAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken);
        return user is not null && !user.IsDisabled && UserStatusPermissions.CanManagePersonnel(user.StatusLabel);
    }

    public async Task DeleteAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("Utilisateur introuvable.");

        userRepository.Remove(user);
        await userRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await userRepository.GetAllAsync(cancellationToken);
        return users.Select(MapToResponse).ToList();
    }

    public async Task<UserResponseDto> SetDisabledAsync(Guid userId, bool isDisabled, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("Utilisateur introuvable.");

        user.IsDisabled = isDisabled;
        await userRepository.SaveChangesAsync(cancellationToken);
        return MapToResponse(user);
    }

    public async Task<UserResponseDto> UpdateCurrentUserProfileAsync(
        Guid userId,
        UserRole currentUserRole,
        UpdateCurrentUserProfileRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("Utilisateur introuvable.");

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();
        user.Phone = request.Phone?.Trim();
        user.Team = string.IsNullOrWhiteSpace(request.Team) ? user.Team : request.Team.Trim();

        if (currentUserRole != UserRole.Auditor && !string.IsNullOrWhiteSpace(request.StatusLabel))
        {
            user.StatusLabel = request.StatusLabel.Trim();
            user.Role = MapStatusLabelToRole(user.StatusLabel);
        }
        else if (currentUserRole == UserRole.Auditor)
        {
            user.StatusLabel = "Auditeur";
            user.Role = UserRole.Auditor;
        }

        await userRepository.SaveChangesAsync(cancellationToken);
        return MapToResponse(user);
    }

    public async Task UpdatePasswordAsync(Guid userId, string password, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new KeyNotFoundException("Utilisateur introuvable.");

        user.PasswordHash = passwordHasher.HashPassword(user, password);
        await userRepository.SaveChangesAsync(cancellationToken);
    }

    public static UserRole MapStatusLabelToRole(string? statusLabel)
    {
        var normalized = statusLabel?.Trim().ToLowerInvariant() ?? string.Empty;

        if (normalized.Contains("directeur"))
        {
            return UserRole.Admin;
        }

        if (normalized.Contains("auditeur") && !normalized.Contains("chef"))
        {
            return UserRole.Auditor;
        }

        return UserRole.Manager;
    }

    public static string GetDefaultStatusLabel(UserRole role)
    {
        return role switch
        {
            UserRole.Admin => "Directeur",
            UserRole.Auditor => "Auditeur",
            _ => "Chef de département",
        };
    }

    private static UserResponseDto MapToResponse(User user)
    {
        return new UserResponseDto
        {
            Email = user.Email,
            FirstName = user.FirstName,
            Id = user.Id,
            IsDisabled = user.IsDisabled,
            LastName = user.LastName,
            Phone = user.Phone,
            Role = user.Role.ToString(),
            StatusLabel = user.StatusLabel,
            Team = user.Team,
        };
    }
}
