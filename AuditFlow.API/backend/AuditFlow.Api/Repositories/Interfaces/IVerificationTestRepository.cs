using AuditFlow.Api.Entities;

namespace AuditFlow.Api.Repositories.Interfaces;

public interface IVerificationTestRepository
{
    Task<IReadOnlyList<VerificationTest>> GetByMissionIdAsync(Guid missionId, CancellationToken ct = default);
    Task<VerificationTest?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task ReplaceForMissionAsync(Guid missionId, IReadOnlyList<VerificationTest> tests, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}