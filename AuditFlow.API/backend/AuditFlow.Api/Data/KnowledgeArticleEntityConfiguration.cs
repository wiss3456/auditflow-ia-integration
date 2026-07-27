using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuditFlow.Api.Data;

public sealed class KnowledgeArticleEntityConfiguration : IEntityTypeConfiguration<KnowledgeArticle>
{
    public void Configure(EntityTypeBuilder<KnowledgeArticle> builder)
    {
        builder.ToTable("knowledge_articles");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).ValueGeneratedNever();
        builder.Property(a => a.Title).HasMaxLength(300).IsRequired();
        builder.Property(a => a.Content).HasMaxLength(8000);
        builder.HasIndex(a => a.KnowledgeDossierId);
        builder.HasOne(a => a.KnowledgeDossier)
            .WithMany(d => d.Articles)
            .HasForeignKey(a => a.KnowledgeDossierId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}