using AuditFlow.Api.DTOs.Verification;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Interfaces;
using AuditFlow.Api.Services.Models;

namespace AuditFlow.Api.Services.Implementations;

public sealed class VerificationTestService(
    HttpClient httpClient,
    IMissionRepository missionRepository,
    IRiskEntryRepository riskEntryRepository,
    IVerificationTestRepository verificationTestRepository) : IVerificationTestService
{
    public async Task<IReadOnlyList<VerificationTestResponseDto>> GenerateAsync(Guid missionId, CancellationToken ct = default)
    {
        var mission = await missionRepository.GetByIdAsync(missionId, ct)
            ?? throw new KeyNotFoundException("Mission introuvable.");

        var existingTests = await verificationTestRepository.GetByMissionIdAsync(missionId, ct);
        if (existingTests.Count > 0)
        {
            return existingTests.Select(MapToDto).ToList();
        }

        var allRisks = await riskEntryRepository.GetByMissionIdAsync(missionId, ct);
        var acceptedRisks = allRisks.Where(r => r.DecisionStatus == RiskDecisionStatus.Accepte).ToList();

        if (acceptedRisks.Count == 0)
            throw new InvalidOperationException("Aucun risque accepté pour cette mission. Acceptez au moins un risque avant de générer le programme de vérification.");

        var risksList = acceptedRisks.Select(r => new
        {
            risque = r.Risque,
            objet_auditable = r.ObjetAuditable,
            sous_objet_auditable = r.SousObjetAuditable,
            evaluation = r.Evaluation,
        }).ToList();

        var genResponse = await httpClient.PostAsJsonAsync("/api/v1/verification/generate", new
        {
            mission_id = missionId.ToString(),
            final_risk_table = new { risks = risksList }
        }, ct);
        genResponse.EnsureSuccessStatusCode();

        var genResult = await genResponse.Content.ReadFromJsonAsync<GenerateVerificationResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Réponse vide de Verification-API.");

        var detailResponse = await httpClient.GetAsync($"/api/v1/verification/{genResult.RequestId}", ct);
        detailResponse.EnsureSuccessStatusCode();

        var detail = await detailResponse.Content.ReadFromJsonAsync<List<VerificationTaskRaw>>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Détail vide renvoyé par Verification-API.");

        var tests = detail.Select((t, index) => new VerificationTest
        {
            Id = Guid.NewGuid(),
            MissionId = missionId,
            TestNumber = $"TV-{(index + 1):D3}",
            Tache = t.Tache,
            Objectif = t.Objectif,
            Methodologie = t.Methodologie,
            Auditor = string.Empty,
            Status = VerificationTestStatus.Ouvert,
            Comments = string.Empty,
            Action = string.Empty,
            IsNonConformity = false,
        }).ToList();

        await verificationTestRepository.ReplaceForMissionAsync(missionId, tests, ct);
        return tests.Select(MapToDto).ToList();
    }

    public async Task<IReadOnlyList<VerificationTestResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken ct = default)
    {
        var tests = await verificationTestRepository.GetByMissionIdAsync(missionId, ct);
        return tests.Select(MapToDto).ToList();
    }

    public async Task<VerificationTestResponseDto> UpdateAsync(Guid testId, UpdateVerificationTestRequestDto request, CancellationToken ct = default)
    {
        var test = await verificationTestRepository.GetByIdAsync(testId, ct)
            ?? throw new KeyNotFoundException("Test introuvable.");

        if (!Enum.TryParse<VerificationTestStatus>(request.Status.Replace(" ", ""), true, out var status))
            status = test.Status;

        test.TestNumber = request.TestNumber;
        test.Tache = request.Tache;
        test.Objectif = request.Objectif;
        test.Methodologie = request.Methodologie;
        test.Auditor = request.Auditor;
        test.Status = status;
        test.StartDate = DateOnly.TryParse(request.StartDate, out var sd) ? sd : null;
        test.EndDate = DateOnly.TryParse(request.EndDate, out var ed) ? ed : null;
        test.Comments = request.Comments;
        test.Action = request.Action;
        test.IsNonConformity = request.IsNonConformity;

        await verificationTestRepository.SaveChangesAsync(ct);
        return MapToDto(test);
    }

    private static VerificationTestResponseDto MapToDto(VerificationTest t) => new()
    {
        Id = t.Id,
        TestNumber = t.TestNumber,
        Tache = t.Tache,
        Objectif = t.Objectif,
        Methodologie = t.Methodologie,
        Auditor = t.Auditor,
        Status = t.Status.ToString(),
        StartDate = t.StartDate?.ToString("yyyy-MM-dd"),
        EndDate = t.EndDate?.ToString("yyyy-MM-dd"),
        Comments = t.Comments,
        Action = t.Action,
        IsNonConformity = t.IsNonConformity,
    };
}