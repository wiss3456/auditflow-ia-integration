using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuditFlow.Api.Data;

public sealed class MissionEntityConfiguration : IEntityTypeConfiguration<Mission>
{
    public void Configure(EntityTypeBuilder<Mission> builder)
    {
        builder.ToTable("missions");

        builder.HasKey(mission => mission.Id);
        builder.Property(mission => mission.Id).ValueGeneratedNever();

        builder.Property(mission => mission.Reference).HasMaxLength(80).IsRequired();
        builder.Property(mission => mission.Title).HasMaxLength(200).IsRequired();
        builder.Property(mission => mission.Client).HasMaxLength(150).IsRequired();
        builder.Property(mission => mission.Site).HasMaxLength(150);
        builder.Property(mission => mission.Objective).HasMaxLength(2000);
        builder.Property(mission => mission.Scope).HasMaxLength(2000);
        builder.Property(mission => mission.Description).HasMaxLength(2000);

        builder.HasIndex(mission => mission.Reference).IsUnique();

        builder.HasOne(mission => mission.OwnerUser)
            .WithMany(user => user.ManagedMissions)
            .HasForeignKey(mission => mission.OwnerUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
