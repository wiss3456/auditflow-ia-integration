using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuditFlow.Api.Data;

public sealed class RiskEntryEntityConfiguration : IEntityTypeConfiguration<RiskEntry>
{
    public void Configure(EntityTypeBuilder<RiskEntry> builder)
    {
        builder.ToTable("risk_entries");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();
        builder.Property(r => r.Risque).HasMaxLength(2000).IsRequired();
        builder.Property(r => r.DecisionStatus).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.HasIndex(r => r.MissionId);
        builder.HasIndex(r => r.DecisionStatus);
        builder.HasOne(r => r.Mission)
            .WithMany(m => m.RiskEntries)
            .HasForeignKey(r => r.MissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}