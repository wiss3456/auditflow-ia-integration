using AuditFlow.Api.Entities;

namespace AuditFlow.Api.Repositories.Interfaces;

public interface IKnowledgeDossierRepository
{
    Task<IReadOnlyList<KnowledgeDossier>> GetByMissionIdAsync(Guid missionId, CancellationToken ct = default);
    Task<KnowledgeDossier?> FindByHashAsync(Guid missionId, string dimensionKey, string contentHash, CancellationToken ct = default);
    Task AddAsync(KnowledgeDossier dossier, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}