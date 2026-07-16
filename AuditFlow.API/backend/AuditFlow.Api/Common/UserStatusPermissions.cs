using System.Globalization;
using System.Text;

namespace AuditFlow.Api.Common;

public static class UserStatusPermissions
{
    public static bool CanManagePersonnel(string? statusLabel)
    {
        var normalizedStatus = NormalizeStatusLabel(statusLabel);

        return normalizedStatus is "directeur" or "chef de departement" or "chef de service" or "chef de mission" or "chef auditeur";
    }

    public static bool CanCreateRequestedStatus(string? creatorStatusLabel, string? targetStatusLabel)
    {
        var normalizedCreatorStatus = NormalizeStatusLabel(creatorStatusLabel);
        var normalizedTargetStatus = NormalizeStatusLabel(targetStatusLabel);

        return normalizedCreatorStatus switch
        {
            "directeur" or "chef de departement" or "chef de service" or "chef de mission" => IsManagedRole(normalizedTargetStatus),
            "chef auditeur" => normalizedTargetStatus == "auditeur",
            _ => false
        };
    }

    private static bool IsManagedRole(string normalizedStatus)
    {
        return normalizedStatus is "chef de service" or "chef de mission" or "chef auditeur" or "auditeur";
    }

    private static string NormalizeStatusLabel(string? statusLabel)
    {
        if (string.IsNullOrWhiteSpace(statusLabel))
        {
            return string.Empty;
        }

        var decomposed = statusLabel.Trim().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);

        foreach (var character in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(char.ToLowerInvariant(character));
            }
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }
}
