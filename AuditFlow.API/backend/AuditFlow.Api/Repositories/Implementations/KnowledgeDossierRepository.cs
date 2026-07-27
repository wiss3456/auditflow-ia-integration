using AuditFlow.Api.Data;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuditFlow.Api.Repositories.Implementations;

public sealed class KnowledgeDossierRepository(AuditFlowDbContext context) : IKnowledgeDossierRepository
{
    public async Task<IReadOnlyList<KnowledgeDossier>> GetByMissionIdAsync(Guid missionId, CancellationToken ct = default)
        => await context.KnowledgeDossiers
            .Include(d => d.Articles)
            .Where(d => d.MissionId == missionId)
            .ToListAsync(ct);

    public async Task<KnowledgeDossier?> FindByHashAsync(
        Guid missionId, string dimensionKey, string contentHash, CancellationToken ct = default)
        => await context.KnowledgeDossiers
            .FirstOrDefaultAsync(d => d.MissionId == missionId
                && d.DimensionKey == dimensionKey
                && d.ContentHash == contentHash, ct);

    public async Task AddAsync(KnowledgeDossier dossier, CancellationToken ct = default)
        => await context.KnowledgeDossiers.AddAsync(dossier, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}