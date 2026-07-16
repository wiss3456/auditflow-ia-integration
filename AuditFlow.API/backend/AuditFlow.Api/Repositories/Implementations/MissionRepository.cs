using AuditFlow.Api.Data;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuditFlow.Api.Repositories.Implementations;

public sealed class MissionRepository(AuditFlowDbContext dbContext) : IMissionRepository
{
    public async Task AddAsync(Mission mission, CancellationToken cancellationToken = default)
    {
        await dbContext.Missions.AddAsync(mission, cancellationToken);
    }

    public async Task<IReadOnlyList<Mission>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Missions
            .Include(mission => mission.OwnerUser)
            .Include(mission => mission.FollowUpActions)
            .OrderByDescending(mission => mission.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Mission?> GetByIdAsync(Guid missionId, CancellationToken cancellationToken = default)
    {
        return dbContext.Missions
            .Include(mission => mission.OwnerUser)
            .Include(mission => mission.FollowUpActions)
            .SingleOrDefaultAsync(mission => mission.Id == missionId, cancellationToken);
    }

    public Task<Mission?> GetByReferenceAsync(string reference, CancellationToken cancellationToken = default)
    {
        var normalizedReference = reference.Trim().ToUpperInvariant();

        return dbContext.Missions
            .Include(mission => mission.OwnerUser)
            .Include(mission => mission.FollowUpActions)
            .SingleOrDefaultAsync(mission => mission.Reference.ToUpper() == normalizedReference, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
