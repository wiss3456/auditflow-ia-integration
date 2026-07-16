using AuditFlow.Api.Common;
using AuditFlow.Api.DTOs.Auth;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace AuditFlow.Api.Services.Implementations;

public sealed class AuthService(
    IUserRepository userRepository,
    IPasswordHasher<User> passwordHasher,
    IJwtTokenService jwtTokenService) : IAuthService
{
    public Task<bool> HasAnyUsersAsync(CancellationToken cancellationToken = default)
    {
        return userRepository.AnyAsync(cancellationToken);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, cancellationToken)
                   ?? throw new UnauthorizedAccessException("Email ou mot de passe invalide.");

        if (user.IsDisabled)
        {
            throw new UnauthorizedAccessException("Ce compte est desactive.");
        }

        var passwordVerification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (passwordVerification == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Email ou mot de passe invalide.");
        }

        return jwtTokenService.CreateToken(user);
    }

    public async Task<UserResponseDto> MeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new UnauthorizedAccessException("Session utilisateur introuvable.");

        if (user.IsDisabled)
        {
            throw new UnauthorizedAccessException("Ce compte est desactive.");
        }

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

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, Guid? currentUserId, CancellationToken cancellationToken = default)
    {
        var hasAnyUsers = await userRepository.AnyAsync(cancellationToken);
        User? currentUser = null;

        if (hasAnyUsers)
        {
            if (!currentUserId.HasValue)
            {
                throw new UnauthorizedAccessException("Authentification requise pour creer un nouvel utilisateur.");
            }

            currentUser = await userRepository.GetByIdAsync(currentUserId.Value, cancellationToken)
                ?? throw new UnauthorizedAccessException("Utilisateur courant introuvable.");

            if (currentUser.IsDisabled)
            {
                throw new UnauthorizedAccessException("Ce compte est desactive.");
            }

            if (!UserStatusPermissions.CanManagePersonnel(currentUser.StatusLabel))
            {
                throw new UnauthorizedAccessException("Vous n'avez pas le droit de creer des utilisateurs.");
            }
        }

        var existingUser = await userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (existingUser is not null)
        {
            throw new InvalidOperationException("Un utilisateur avec cette adresse e-mail existe deja.");
        }

        var statusLabel = !string.IsNullOrWhiteSpace(request.StatusLabel)
            ? request.StatusLabel.Trim()
            : UserService.GetDefaultStatusLabel(request.Role);
        var requestedRole = request.Role;

        if (hasAnyUsers)
        {
            if (!UserStatusPermissions.CanCreateRequestedStatus(currentUser?.StatusLabel, statusLabel))
            {
                throw new InvalidOperationException("Vous n'avez pas le droit de creer ce type d'utilisateur.");
            }

            requestedRole = UserService.MapStatusLabelToRole(statusLabel);
        }

        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            FirstName = request.FirstName.Trim(),
            Id = Guid.NewGuid(),
            IsDisabled = false,
            LastName = request.LastName.Trim(),
            Phone = request.Phone?.Trim(),
            Role = requestedRole,
            StatusLabel = statusLabel,
            Team = string.IsNullOrWhiteSpace(request.Team) ? "1" : request.Team.Trim()
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return jwtTokenService.CreateToken(user);
    }
}
