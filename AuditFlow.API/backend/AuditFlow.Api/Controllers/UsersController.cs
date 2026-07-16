using System.Security.Claims;
using AuditFlow.Api.DTOs.Auth;
using AuditFlow.Api.DTOs.Users;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuditFlow.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/users")]
public sealed class UsersController(IUserService userService) : ControllerBase
{
    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Manager)}")]
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UserResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UserResponseDto>>> GetAll(CancellationToken cancellationToken)
    {
        if (!await HasPersonnelManagementAccessAsync(cancellationToken))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Vous n'avez pas le droit de gerer les comptes utilisateurs." });
        }

        var response = await userService.GetAllAsync(cancellationToken);
        return Ok(response);
    }

    [HttpPut("me/profile")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> UpdateProfile([FromBody] UpdateCurrentUserProfileRequestDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var currentUserId) || !TryGetCurrentUserRole(out var currentUserRole))
        {
            return Unauthorized();
        }

        try
        {
            var response = await userService.UpdateCurrentUserProfileAsync(currentUserId, currentUserRole, request, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPut("me/password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdatePassword([FromBody] UpdateCurrentUserPasswordRequestDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        try
        {
            await userService.UpdatePasswordAsync(currentUserId, request.Password, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Manager)}")]
    [HttpPatch("{userId:guid}/disabled-state")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponseDto>> UpdateDisabledState(Guid userId, [FromBody] UpdateUserDisabledStateRequestDto request, CancellationToken cancellationToken)
    {
        if (!await HasPersonnelManagementAccessAsync(cancellationToken))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Vous n'avez pas le droit de gerer les comptes utilisateurs." });
        }

        try
        {
            var response = await userService.SetDisabledAsync(userId, request.IsDisabled, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Manager)}")]
    [HttpDelete("{userId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid userId, CancellationToken cancellationToken)
    {
        if (!await HasPersonnelManagementAccessAsync(cancellationToken))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Vous n'avez pas le droit de gerer les comptes utilisateurs." });
        }

        try
        {
            await userService.DeleteAsync(userId, cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    private bool TryGetCurrentUserId(out Guid currentUserId)
    {
        var rawUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(rawUserId, out currentUserId);
    }

    private bool TryGetCurrentUserRole(out UserRole userRole)
    {
        var rawRole = User.FindFirstValue(ClaimTypes.Role);
        return Enum.TryParse(rawRole, ignoreCase: true, out userRole);
    }

    private async Task<bool> HasPersonnelManagementAccessAsync(CancellationToken cancellationToken)
    {
        return TryGetCurrentUserId(out var currentUserId) && await userService.CanManagePersonnelAsync(currentUserId, cancellationToken);
    }
}
