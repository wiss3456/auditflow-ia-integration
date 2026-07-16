using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuditFlow.Api.Data;

public sealed class FollowUpActionEntityConfiguration : IEntityTypeConfiguration<FollowUpAction>
{
    public void Configure(EntityTypeBuilder<FollowUpAction> builder)
    {
        builder.ToTable("follow_up_actions");

        builder.HasKey(action => action.Id);
        builder.Property(action => action.Id).ValueGeneratedNever();

        builder.Property(action => action.Title).HasMaxLength(200).IsRequired();
        builder.Property(action => action.RecommendationNumber).HasMaxLength(50);
        builder.Property(action => action.Recommendation).HasMaxLength(4000);
        builder.Property(action => action.ActionDetail).HasMaxLength(4000);
        builder.Property(action => action.Description).HasMaxLength(4000);
        builder.Property(action => action.OwnerDisplayName).HasMaxLength(200);
        builder.Property(action => action.DeadlineLabel).HasMaxLength(120);
        builder.Property(action => action.Remarks).HasMaxLength(4000);
        builder.Property(action => action.Status).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(action => action.BoardStatus).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(action => action.Evaluation).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(action => action.RecommendationStatus).HasConversion<string>().HasMaxLength(40).IsRequired();

        builder.HasIndex(action => action.MissionId);
        builder.HasIndex(action => action.AssignedUserId);
        builder.HasIndex(action => action.Status);
        builder.HasIndex(action => action.BoardStatus);
        builder.HasIndex(action => action.RecommendationStatus);

        builder.HasOne(action => action.Mission)
            .WithMany(mission => mission.FollowUpActions)
            .HasForeignKey(action => action.MissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(action => action.CreatedByUser)
            .WithMany(user => user.CreatedFollowUpActions)
            .HasForeignKey(action => action.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(action => action.AssignedUser)
            .WithMany(user => user.AssignedFollowUpActions)
            .HasForeignKey(action => action.AssignedUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
