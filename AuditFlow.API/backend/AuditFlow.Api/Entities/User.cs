using AuditFlow.Api.Enums;

namespace AuditFlow.Api.Entities;

public sealed class User : BaseEntity
{
    public ICollection<FollowUpAction> AssignedFollowUpActions { get; set; } = new List<FollowUpAction>();
    public ICollection<FollowUpAction> CreatedFollowUpActions { get; set; } = new List<FollowUpAction>();
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public bool IsDisabled { get; set; }
    public string LastName { get; set; } = string.Empty;
    public ICollection<Mission> ManagedMissions { get; set; } = new List<Mission>();
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; } = UserRole.Auditor;
    public string StatusLabel { get; set; } = "Auditeur";
    public string Team { get; set; } = "1";

    public string FullName => $"{FirstName} {LastName}".Trim();
}
