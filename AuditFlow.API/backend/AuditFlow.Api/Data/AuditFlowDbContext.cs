using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuditFlow.Api.Data;

public sealed class AuditFlowDbContext(DbContextOptions<AuditFlowDbContext> options) : DbContext(options)
{
    public DbSet<FollowUpAction> FollowUpActions => Set<FollowUpAction>();
    public DbSet<Mission> Missions => Set<Mission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RiskEntry> RiskEntries => Set<RiskEntry>();
    public DbSet<KnowledgeDossier> KnowledgeDossiers => Set<KnowledgeDossier>();
    public DbSet<KnowledgeArticle> KnowledgeArticles => Set<KnowledgeArticle>();
    public DbSet<VerificationTest> VerificationTests => Set<VerificationTest>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AuditFlowDbContext).Assembly);
    }

    public override int SaveChanges()
    {
        ApplyAuditTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditTimestamps()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}
