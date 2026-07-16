using AuditFlow.Api.Data;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuditFlow.Api.Repositories.Implementations;

public sealed class FollowUpActionRepository(AuditFlowDbContext dbContext) : IFollowUpActionRepository
{
    public async Task AddAsync(FollowUpAction action, CancellationToken cancellationToken = default)
    {
        await dbContext.FollowUpActions.AddAsync(action, cancellationToken);
    }

    public async Task<IReadOnlyList<FollowUpAction>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.FollowUpActions
            .Include(action => action.AssignedUser)
            .Include(action => action.CreatedByUser)
            .OrderByDescending(action => action.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<FollowUpAction?> GetByIdAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        return dbContext.FollowUpActions
            .Include(action => action.AssignedUser)
            .Include(action => action.CreatedByUser)
            .SingleOrDefaultAsync(action => action.Id == actionId, cancellationToken);
    }

    public async Task<IReadOnlyList<FollowUpAction>> GetByMissionIdAsync(Guid missionId, CancellationToken cancellationToken = default)
    {
        return await dbContext.FollowUpActions
            .Include(action => action.AssignedUser)
            .Include(action => action.CreatedByUser)
            .Where(action => action.MissionId == missionId)
            .OrderByDescending(action => action.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public void Remove(FollowUpAction action)
    {
        dbContext.FollowUpActions.Remove(action);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
