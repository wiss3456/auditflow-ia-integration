using AuditFlow.Api.Entities;

namespace AuditFlow.Api.Repositories.Interfaces;

public interface IFollowUpActionRepository
{
    Task AddAsync(FollowUpAction action, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FollowUpAction>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<FollowUpAction?> GetByIdAsync(Guid actionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FollowUpAction>> GetByMissionIdAsync(Guid missionId, CancellationToken cancellationToken = default);
    void Remove(FollowUpAction action);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
