using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuditFlow.Api.Data;

public sealed class KnowledgeDossierEntityConfiguration : IEntityTypeConfiguration<KnowledgeDossier>
{
    public void Configure(EntityTypeBuilder<KnowledgeDossier> builder)
    {
        builder.ToTable("knowledge_dossiers");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedNever();
        builder.Property(d => d.DimensionKey).HasMaxLength(80).IsRequired();
        builder.Property(d => d.Summary).HasMaxLength(4000);
        builder.HasIndex(d => d.MissionId);
        builder.HasOne(d => d.Mission)
            .WithMany(m => m.KnowledgeDossiers)
            .HasForeignKey(d => d.MissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}