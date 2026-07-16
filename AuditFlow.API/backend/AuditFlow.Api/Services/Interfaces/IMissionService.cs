using AuditFlow.Api.DTOs.Missions;

namespace AuditFlow.Api.Services.Interfaces;

public interface IMissionService
{
    Task<MissionResponseDto> CreateAsync(CreateMissionRequestDto request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MissionResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<MissionResponseDto> GetByIdAsync(Guid missionId, CancellationToken cancellationToken = default);
}
