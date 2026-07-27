using AuditFlow.Api.DTOs.Verification;

namespace AuditFlow.Api.Services.Interfaces;

public interface IVerificationTestService
{
    Task<IReadOnlyList<VerificationTestResponseDto>> GenerateAsync(Guid missionId, CancellationToken ct = default);
    Task<IReadOnlyList<VerificationTestResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken ct = default);
    Task<VerificationTestResponseDto> UpdateAsync(Guid testId, UpdateVerificationTestRequestDto request, CancellationToken ct = default);
}