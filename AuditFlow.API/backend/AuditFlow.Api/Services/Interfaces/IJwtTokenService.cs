using AuditFlow.Api.Entities;
using AuditFlow.Api.DTOs.Auth;

namespace AuditFlow.Api.Services.Interfaces;

public interface IJwtTokenService
{
    AuthResponseDto CreateToken(User user);
}
