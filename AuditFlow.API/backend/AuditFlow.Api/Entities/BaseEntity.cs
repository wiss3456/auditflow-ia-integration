namespace AuditFlow.Api.Entities;

public abstract class BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public Guid Id { get; set; }
    public DateTime UpdatedAt { get; set; }
}
