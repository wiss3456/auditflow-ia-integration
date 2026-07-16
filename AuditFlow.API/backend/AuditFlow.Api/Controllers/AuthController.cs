using System.Security.Claims;
using AuditFlow.Api.DTOs.Auth;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuditFlow.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await authService.LoginAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { message = exception.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var hasAnyUsers = await authService.HasAnyUsersAsync(cancellationToken);
        Guid? currentUserId = null;

        if (hasAnyUsers && User.Identity?.IsAuthenticated != true)
        {
            return Unauthorized(new { message = "Authentification requise pour creer un nouvel utilisateur." });
        }

      if (hasAnyUsers)
    {
        if (!TryGetCurrentUserId(out var parsedCurrentUserId))
        {
          return Unauthorized(new { message = "Utilisateur courant introuvable." });
        }
        currentUserId = parsedCurrentUserId;
      }

    try
        {
            var response = await authService.RegisterAsync(request, currentUserId, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserResponseDto>> Me(CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var parsedUserId))
        {
            return Unauthorized();
        }

        try
        {
            var user = await authService.MeAsync(parsedUserId, cancellationToken);
            return Ok(user);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(new { message = exception.Message });
        }
    }

    private bool TryGetCurrentUserId(out Guid currentUserId)
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(rawUserId, out currentUserId);
    }
}
