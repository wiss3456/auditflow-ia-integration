using AuditFlow.Api.Data;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AuditFlow.Api.Repositories.Implementations;

public sealed class UserRepository(AuditFlowDbContext dbContext) : IUserRepository
{
    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await dbContext.Users.AddAsync(user, cancellationToken);
    }

    public Task<bool> AnyAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.Users.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Users.OrderBy(user => user.FirstName).ThenBy(user => user.LastName).ToListAsync(cancellationToken);
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        return dbContext.Users.SingleOrDefaultAsync(user => user.Email.ToLower() == normalizedEmail, cancellationToken);
    }

    public Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return dbContext.Users.SingleOrDefaultAsync(user => user.Id == userId, cancellationToken);
    }

    public void Remove(User user)
    {
        dbContext.Users.Remove(user);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
