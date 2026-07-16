using AuditFlow.Api.Entities;

namespace AuditFlow.Api.Repositories.Interfaces;

public interface IMissionRepository
{
    Task AddAsync(Mission mission, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Mission>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Mission?> GetByIdAsync(Guid missionId, CancellationToken cancellationToken = default);
    Task<Mission?> GetByReferenceAsync(string reference, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
