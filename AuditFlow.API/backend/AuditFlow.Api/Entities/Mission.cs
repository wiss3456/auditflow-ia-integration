namespace AuditFlow.Api.Entities;

public sealed class Mission : BaseEntity
{
    public string Client { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly DueDate { get; set; }
    public ICollection<FollowUpAction> FollowUpActions { get; set; } = new List<FollowUpAction>();
    public ICollection<RiskEntry> RiskEntries { get; set; } = new List<RiskEntry>();
    public ICollection<KnowledgeDossier> KnowledgeDossiers { get; set; } = new List<KnowledgeDossier>();
    public ICollection<VerificationTest> VerificationTests { get; set; } = new List<VerificationTest>();
    public string? Objective { get; set; }
    public Guid? OwnerUserId { get; set; }
    public User? OwnerUser { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string? Scope { get; set; }
    public string? Site { get; set; }
    public string Title { get; set; } = string.Empty;
}
