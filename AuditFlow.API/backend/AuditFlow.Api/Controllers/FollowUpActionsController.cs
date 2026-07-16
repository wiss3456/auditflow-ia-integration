using System.Security.Claims;
using AuditFlow.Api.DTOs.FollowUpActions;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuditFlow.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/follow-up-actions")]
public sealed class FollowUpActionsController(IFollowUpActionService followUpActionService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<FollowUpActionResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<FollowUpActionResponseDto>>> GetAll(CancellationToken cancellationToken)
    {
        var response = await followUpActionService.GetAllAsync(cancellationToken);
        return Ok(response);
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Manager)}")]
    [HttpPost]
    [ProducesResponseType(typeof(FollowUpActionResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowUpActionResponseDto>> Create([FromBody] CreateFollowUpActionRequestDto request, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var currentUserId))
        {
            return Unauthorized();
        }

        try
        {
            var response = await followUpActionService.CreateAsync(request, currentUserId, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpGet("mission/{missionId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<FollowUpActionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<FollowUpActionResponseDto>>> GetByMission(Guid missionId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await followUpActionService.GetByMissionAsync(missionId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPatch("{actionId:guid}/status")]
    [ProducesResponseType(typeof(FollowUpActionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowUpActionResponseDto>> UpdateStatus(
        Guid actionId,
        [FromBody] UpdateFollowUpActionStatusRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var currentUserId) || !TryGetCurrentUserRole(out var currentUserRole))
        {
            return Unauthorized();
        }

        try
        {
            var response = await followUpActionService.UpdateStatusAsync(actionId, request.Status, currentUserId, currentUserRole, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Manager)}")]
    [HttpPatch("{actionId:guid}/assign")]
    [ProducesResponseType(typeof(FollowUpActionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowUpActionResponseDto>> Assign(
        Guid actionId,
        [FromBody] AssignFollowUpActionRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await followUpActionService.AssignUserAsync(actionId, request.AssignedUserId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPatch("{actionId:guid}/board-status")]
    [ProducesResponseType(typeof(FollowUpActionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowUpActionResponseDto>> UpdateBoardStatus(
        Guid actionId,
        [FromBody] UpdateFollowUpActionBoardStatusRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var currentUserId) || !TryGetCurrentUserRole(out var currentUserRole))
        {
            return Unauthorized();
        }

        try
        {
            var response = await followUpActionService.UpdateBoardStatusAsync(actionId, request.Status, currentUserId, currentUserRole, cancellationToken);
            return Ok(response);
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = exception.Message });
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [HttpPatch("{actionId:guid}/recommendation-status")]
    [ProducesResponseType(typeof(FollowUpActionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowUpActionResponseDto>> UpdateRecommendationStatus(
        Guid actionId,
        [FromBody] UpdateFollowUpActionRecommendationStatusRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await followUpActionService.UpdateRecommendationStatusAsync(actionId, request.Status, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Manager)}")]
    [HttpDelete("{actionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid actionId, CancellationToken cancellationToken)
    {
        try
        {
            await followUpActionService.DeleteAsync(actionId, cancellationToken);
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
}
