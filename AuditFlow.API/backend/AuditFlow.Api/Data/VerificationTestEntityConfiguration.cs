using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuditFlow.Api.Data;

public sealed class VerificationTestEntityConfiguration : IEntityTypeConfiguration<VerificationTest>
{
    public void Configure(EntityTypeBuilder<VerificationTest> builder)
    {
        builder.ToTable("verification_tests");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();
        builder.Property(t => t.Tache).HasMaxLength(2000).IsRequired();
        builder.Property(t => t.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.HasIndex(t => t.MissionId);

        builder.HasOne(t => t.Mission)
            .WithMany(m => m.VerificationTests)
            .HasForeignKey(t => t.MissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(t => t.RiskEntry)
            .WithMany()
            .HasForeignKey(t => t.RiskEntryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(t => t.AssignedUser)
            .WithMany()
            .HasForeignKey(t => t.AssignedUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}