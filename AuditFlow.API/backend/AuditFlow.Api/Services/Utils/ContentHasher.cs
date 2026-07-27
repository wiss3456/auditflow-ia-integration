using System.Security.Cryptography;
using System.Text;

namespace AuditFlow.Api.Services.Utils;

public static class ContentHasher
{
    public static string Compute(string text)
    {
        var normalized = text.Trim();
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(bytes);
    }
}