using AuditFlow.Api.Data;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using AuditFlow.Api.Enums;

namespace AuditFlow.Api.Repositories.Implementations;

public sealed class RiskEntryRepository(AuditFlowDbContext context) : IRiskEntryRepository
{
    public async Task ReplaceForMissionAsync(Guid missionId, IReadOnlyList<RiskEntry> entries, CancellationToken ct = default)
{
    var existing = context.RiskEntries.Where(r => r.MissionId == missionId);
    context.RiskEntries.RemoveRange(existing);
    await context.RiskEntries.AddRangeAsync(entries, ct);
    await context.SaveChangesAsync(ct);
}
    public async Task UpdateDecisionStatusAsync(Guid riskEntryId, RiskDecisionStatus status, CancellationToken ct = default)
{
    var entry = await context.RiskEntries.FirstOrDefaultAsync(r => r.Id == riskEntryId, ct)
        ?? throw new KeyNotFoundException("Risque introuvable.");
    entry.DecisionStatus = status;
    await context.SaveChangesAsync(ct);
}
public async Task<RiskEntry?> GetByIdAsync(Guid id, CancellationToken ct = default)
    => await context.RiskEntries.FirstOrDefaultAsync(r => r.Id == id, ct);
    public async Task<IReadOnlyList<RiskEntry>> GetByMissionIdAsync(Guid missionId, CancellationToken ct = default)
        => await context.RiskEntries
            .Where(r => r.MissionId == missionId)
            .ToListAsync(ct);

    public async Task AddAsync(RiskEntry entry, CancellationToken ct = default)
        => await context.RiskEntries.AddAsync(entry, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => context.SaveChangesAsync(ct);
}