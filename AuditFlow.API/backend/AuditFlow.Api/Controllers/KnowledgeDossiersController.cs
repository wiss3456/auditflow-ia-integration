using AuditFlow.Api.DTOs.Knowledge;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuditFlow.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public sealed class KnowledgeDossiersController(IKnowledgeDossierService knowledgeDossierService) : ControllerBase
{
    [HttpPost("missions/{missionId:guid}/knowledge")]
    public async Task<ActionResult<KnowledgeDossierResponseDto>> Create(
        Guid missionId, [FromBody] CreateKnowledgeDossierRequestDto request, CancellationToken ct)
    {
        try { return Ok(await knowledgeDossierService.CreateAsync(missionId, request, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpGet("missions/{missionId:guid}/knowledge")]
    public async Task<ActionResult<IReadOnlyList<KnowledgeDossierResponseDto>>> GetByMission(Guid missionId, CancellationToken ct)
        => Ok(await knowledgeDossierService.GetByMissionAsync(missionId, ct));

    [HttpPost("missions/{missionId:guid}/knowledge/generate")]
    public async Task<ActionResult<IReadOnlyList<KnowledgeDossierResponseDto>>> Generate(Guid missionId, CancellationToken ct)
    {
        try { return Ok(await knowledgeDossierService.GenerateAsync(missionId, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (HttpRequestException ex) { return StatusCode(502, new { message = $"Knowledge_API injoignable ou en erreur : {ex.Message}" }); }
    }
}