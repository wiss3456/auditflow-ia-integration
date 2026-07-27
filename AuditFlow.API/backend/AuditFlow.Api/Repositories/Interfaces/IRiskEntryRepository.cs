using AuditFlow.Api.Entities;
using AuditFlow.Api.Enums;
namespace AuditFlow.Api.Repositories.Interfaces;

public interface IRiskEntryRepository
{
    Task<IReadOnlyList<RiskEntry>> GetByMissionIdAsync(Guid missionId, CancellationToken ct = default);
    Task AddAsync(RiskEntry entry, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    Task ReplaceForMissionAsync(Guid missionId, IReadOnlyList<RiskEntry> entries, CancellationToken ct = default);
    Task UpdateDecisionStatusAsync(Guid riskEntryId, RiskDecisionStatus status, CancellationToken ct = default);
    Task<RiskEntry?> GetByIdAsync(Guid id, CancellationToken ct = default);
}