using AuditFlow.Api.DTOs.Knowledge;

namespace AuditFlow.Api.Services.Interfaces;

public interface IKnowledgeDossierService
{
    Task<KnowledgeDossierResponseDto> CreateAsync(Guid missionId, CreateKnowledgeDossierRequestDto request, CancellationToken ct = default);
    Task<IReadOnlyList<KnowledgeDossierResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken ct = default);
    Task<IReadOnlyList<KnowledgeDossierResponseDto>> GenerateAsync(Guid missionId, CancellationToken ct = default);  
}