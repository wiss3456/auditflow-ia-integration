using AuditFlow.Api.DTOs.Verification;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuditFlow.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public sealed class VerificationTestsController(IVerificationTestService verificationTestService) : ControllerBase
{
    [HttpPost("missions/{missionId:guid}/verification/generate")]
    public async Task<ActionResult<IReadOnlyList<VerificationTestResponseDto>>> Generate(Guid missionId, CancellationToken ct)
    {
        try { return Ok(await verificationTestService.GenerateAsync(missionId, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (HttpRequestException ex) { return StatusCode(502, new { message = $"Verification-API injoignable : {ex.Message}" }); }
    }

    [HttpGet("missions/{missionId:guid}/verification")]
    public async Task<ActionResult<IReadOnlyList<VerificationTestResponseDto>>> GetByMission(Guid missionId, CancellationToken ct)
        => Ok(await verificationTestService.GetByMissionAsync(missionId, ct));

    [HttpPatch("verification-tests/{testId:guid}")]
    public async Task<ActionResult<VerificationTestResponseDto>> Update(
        Guid testId, [FromBody] UpdateVerificationTestRequestDto request, CancellationToken ct)
    {
        try { return Ok(await verificationTestService.UpdateAsync(testId, request, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}