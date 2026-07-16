namespace AuditFlow.Api.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Audience { get; set; } = "AuditFlow.Client";
    public int ExpiresInMinutes { get; set; } = 120;
    public string Issuer { get; set; } = "AuditFlow.Api";
    public string Key { get; set; } = "CHANGE_THIS_TO_A_LONG_SECRET_KEY_WITH_AT_LEAST_32_CHARACTERS";
}
