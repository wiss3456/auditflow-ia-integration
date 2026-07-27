using AuditFlow.Api.DTOs.Risks;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuditFlow.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public sealed class RiskEntriesController(IRiskEntryService riskEntryService) : ControllerBase
{
    [HttpPatch("risks/{riskId:guid}/decision")]
public async Task<ActionResult<RiskEntryResponseDto>> UpdateDecision(
    Guid riskId, [FromBody] UpdateDecisionRequest request, CancellationToken ct)
{
    try
    {
        var result = await riskEntryService.UpdateDecisionStatusAsync(riskId, request.Status, ct);
        return Ok(result);
    }
    catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
}
    [HttpPost("missions/{missionId:guid}/risks")]
    public async Task<ActionResult<RiskEntryResponseDto>> Create(
        Guid missionId, [FromBody] CreateRiskEntryRequestDto request, CancellationToken ct)
    {
        try
        {
            var result = await riskEntryService.CreateAsync(missionId, request, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("missions/{missionId:guid}/risks")]
    public async Task<ActionResult<IReadOnlyList<RiskEntryResponseDto>>> GetByMission(Guid missionId, CancellationToken ct)
        => Ok(await riskEntryService.GetByMissionAsync(missionId, ct));

    [HttpPost("missions/{missionId:guid}/risks/generate")]
    public async Task<ActionResult<IReadOnlyList<RiskEntryResponseDto>>> Generate(Guid missionId, CancellationToken ct)
    {
        try
        {
            var result = await riskEntryService.GenerateAsync(missionId, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new { message = $"RiskAdviserCn injoignable : {ex.Message}" });
        }
    }
}