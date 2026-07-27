using AuditFlow.Api.DTOs.Risks;

namespace AuditFlow.Api.Services.Interfaces;

public interface IRiskEntryService
{
    Task<RiskEntryResponseDto> CreateAsync(Guid missionId, CreateRiskEntryRequestDto request, CancellationToken ct = default);
    Task<IReadOnlyList<RiskEntryResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken ct = default);
    Task<IReadOnlyList<RiskEntryResponseDto>> GenerateAsync(Guid missionId, CancellationToken ct = default);
    Task<RiskEntryResponseDto> UpdateDecisionStatusAsync(Guid riskEntryId, string status, CancellationToken ct = default);
}