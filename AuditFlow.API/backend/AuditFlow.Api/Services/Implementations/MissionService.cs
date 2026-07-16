using AuditFlow.Api.DTOs.Missions;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Interfaces;

namespace AuditFlow.Api.Services.Implementations;

public sealed class MissionService(
    IMissionRepository missionRepository,
    IUserRepository userRepository) : IMissionService
{
    public async Task<MissionResponseDto> CreateAsync(CreateMissionRequestDto request, CancellationToken cancellationToken = default)
    {
        var existingMission = await missionRepository.GetByReferenceAsync(request.Reference, cancellationToken);

        if (existingMission is not null)
        {
            throw new InvalidOperationException("Une mission avec cette reference existe deja.");
        }

        User? ownerUser = null;

        if (request.OwnerUserId.HasValue)
        {
            ownerUser = await userRepository.GetByIdAsync(request.OwnerUserId.Value, cancellationToken)
                ?? throw new KeyNotFoundException("Responsable de mission introuvable.");
        }

        var mission = new Mission
        {
            Client = request.Client.Trim(),
            Description = request.Description?.Trim(),
            DueDate = request.DueDate,
            Id = Guid.NewGuid(),
            Objective = request.Objective?.Trim(),
            OwnerUserId = ownerUser?.Id,
            Reference = request.Reference.Trim().ToUpperInvariant(),
            Scope = request.Scope?.Trim(),
            Site = request.Site?.Trim(),
            Title = request.Title.Trim()
        };

        await missionRepository.AddAsync(mission, cancellationToken);
        await missionRepository.SaveChangesAsync(cancellationToken);

        mission.OwnerUser = ownerUser;

        return MapToResponse(mission);
    }

    public async Task<IReadOnlyList<MissionResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var missions = await missionRepository.GetAllAsync(cancellationToken);
        return missions.Select(MapToResponse).ToList();
    }

    public async Task<MissionResponseDto> GetByIdAsync(Guid missionId, CancellationToken cancellationToken = default)
    {
        var mission = await missionRepository.GetByIdAsync(missionId, cancellationToken)
            ?? throw new KeyNotFoundException("Mission introuvable.");

        return MapToResponse(mission);
    }

    private static MissionResponseDto MapToResponse(Mission mission)
    {
        return new MissionResponseDto
        {
            Client = mission.Client,
            CreatedAtUtc = mission.CreatedAt,
            Description = mission.Description,
            DueDate = mission.DueDate,
            FollowUpActionCount = mission.FollowUpActions.Count,
            Id = mission.Id,
            Objective = mission.Objective,
            OwnerUserId = mission.OwnerUserId,
            OwnerUserName = mission.OwnerUser?.FullName,
            Reference = mission.Reference,
            Scope = mission.Scope,
            Site = mission.Site,
            Title = mission.Title,
            UpdatedAtUtc = mission.UpdatedAt
        };
    }
}
