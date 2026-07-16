using AuditFlow.Api.DTOs.FollowUpActions;
using AuditFlow.Api.Enums;

namespace AuditFlow.Api.Services.Interfaces;

public interface IFollowUpActionService
{
    Task<FollowUpActionResponseDto> AssignUserAsync(Guid actionId, Guid assignedUserId, CancellationToken cancellationToken = default);
    Task<FollowUpActionResponseDto> CreateAsync(CreateFollowUpActionRequestDto request, Guid currentUserId, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid actionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FollowUpActionResponseDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FollowUpActionResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken cancellationToken = default);
    Task<FollowUpActionResponseDto> UpdateBoardStatusAsync(Guid actionId, string boardStatus, Guid currentUserId, UserRole currentUserRole, CancellationToken cancellationToken = default);
    Task<FollowUpActionResponseDto> UpdateRecommendationStatusAsync(Guid actionId, string recommendationStatus, CancellationToken cancellationToken = default);
    Task<FollowUpActionResponseDto> UpdateStatusAsync(Guid actionId, FollowUpActionStatus status, Guid currentUserId, UserRole currentUserRole, CancellationToken cancellationToken = default);
}
