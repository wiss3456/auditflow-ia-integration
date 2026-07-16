using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuditFlow.Api.Configuration;
using AuditFlow.Api.DTOs.Auth;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AuditFlow.Api.Services.Implementations;

public sealed class JwtTokenService(IOptions<JwtOptions> jwtOptionsAccessor) : IJwtTokenService
{
    private readonly JwtOptions _jwtOptions = jwtOptionsAccessor.Value;

    public AuthResponseDto CreateToken(User user)
    {
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiresInMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.GivenName, user.FirstName),
            new Claim(ClaimTypes.Surname, user.LastName),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials
        );

        return new AuthResponseDto
        {
            ExpiresAtUtc = expiresAtUtc,
            Token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor),
            User = new UserResponseDto
            {
                Email = user.Email,
                FirstName = user.FirstName,
                Id = user.Id,
                IsDisabled = user.IsDisabled,
                LastName = user.LastName,
                Phone = user.Phone,
                Role = user.Role.ToString(),
                StatusLabel = user.StatusLabel,
                Team = user.Team
            }
        };
    }
}
