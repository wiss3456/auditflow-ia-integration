using AuditFlow.Api.Data;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuditFlow.Api.Repositories.Implementations;

public sealed class VerificationTestRepository(AuditFlowDbContext context) : IVerificationTestRepository
{
    public async Task<IReadOnlyList<VerificationTest>> GetByMissionIdAsync(Guid missionId, CancellationToken ct = default)
        => await context.VerificationTests.Where(v => v.MissionId == missionId).ToListAsync(ct);

    public async Task<VerificationTest?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await context.VerificationTests.FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task ReplaceForMissionAsync(Guid missionId, IReadOnlyList<VerificationTest> tests, CancellationToken ct = default)
    {
        var existing = context.VerificationTests.Where(v => v.MissionId == missionId);
        context.VerificationTests.RemoveRange(existing);
        await context.VerificationTests.AddRangeAsync(tests, ct);
        await context.SaveChangesAsync(ct);
    }

    public Task SaveChangesAsync(CancellationToken ct = default) => context.SaveChangesAsync(ct);
}