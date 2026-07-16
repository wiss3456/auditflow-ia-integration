using AuditFlow.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AuditFlow.Api.Data;

public sealed class UserEntityConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(user => user.Id);
        builder.Property(user => user.Id).ValueGeneratedNever();

        builder.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(user => user.LastName).HasMaxLength(100).IsRequired();
        builder.Property(user => user.Email).HasMaxLength(255).IsRequired();
        builder.Property(user => user.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(user => user.Phone).HasMaxLength(40);
        builder.Property(user => user.Role).HasConversion<string>().HasMaxLength(40).IsRequired();
        builder.Property(user => user.StatusLabel).HasMaxLength(80).IsRequired();
        builder.Property(user => user.Team).HasMaxLength(10).IsRequired();
        builder.Property(user => user.IsDisabled).IsRequired();

        builder.HasIndex(user => user.Email).IsUnique();
    }
}
