using AuditFlow.Api.DTOs.Missions;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuditFlow.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/missions")]
public sealed class MissionsController(IMissionService missionService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MissionResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MissionResponseDto>>> GetAll(CancellationToken cancellationToken)
    {
        var response = await missionService.GetAllAsync(cancellationToken);
        return Ok(response);
    }

    [HttpGet("{missionId:guid}")]
    [ProducesResponseType(typeof(MissionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MissionResponseDto>> GetById(Guid missionId, CancellationToken cancellationToken)
    {
        try
        {
            var response = await missionService.GetByIdAsync(missionId, cancellationToken);
            return Ok(response);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
    }

    [Authorize(Roles = $"{nameof(UserRole.Admin)},{nameof(UserRole.Manager)}")]
    [HttpPost]
    [ProducesResponseType(typeof(MissionResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MissionResponseDto>> Create([FromBody] CreateMissionRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await missionService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { missionId = response.Id }, response);
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
}
