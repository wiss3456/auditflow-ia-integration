using AuditFlow.Api.DTOs.Risks;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Interfaces;
using AuditFlow.Api.Services.Models;

namespace AuditFlow.Api.Services.Implementations;

public sealed class RiskEntryService(
    HttpClient httpClient,
    IRiskEntryRepository riskEntryRepository,
    IMissionRepository missionRepository) : IRiskEntryService
{
    public async Task<IReadOnlyList<RiskEntryResponseDto>> GenerateAsync(Guid missionId, CancellationToken ct = default)
{
    var mission = await missionRepository.GetByIdAsync(missionId, ct)
        ?? throw new KeyNotFoundException("Mission introuvable.");

    
    var existingEntries = await riskEntryRepository.GetByMissionIdAsync(missionId, ct);
    if (existingEntries.Count > 0)
    {
        
        return existingEntries.Select(MapToDto).ToList();
    }

    
    var genResponse = await httpClient.PostAsJsonAsync("/gen_risks", new
    {
        mission = mission.Title,
        processes = new[] { mission.Objective ?? mission.Title }
    }, ct);
        genResponse.EnsureSuccessStatusCode();

        var genResult = await genResponse.Content.ReadFromJsonAsync<GenRisksResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Réponse vide de RiskAdviserCn.");

        var detailResponse = await httpClient.GetAsync($"/get_risks/{genResult.RequestId}", ct);
        detailResponse.EnsureSuccessStatusCode();

        var detail = await detailResponse.Content.ReadFromJsonAsync<RiskAdvisorRawOutput>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Détail vide renvoyé par RiskAdviserCn.");

        var entries = new List<RiskEntry>();
        foreach (var objet in detail.TariTable)
        {
            foreach (var sousObjet in objet.SousObjets)
            {
                foreach (var risque in sousObjet.Risques)
                {
                    entries.Add(new RiskEntry
                    {
                        Id = Guid.NewGuid(),
                        MissionId = missionId,
                        RequestId = genResult.RequestId,
                        ObjetAuditable = objet.ObjetAuditable,
                        SousObjetAuditable = sousObjet.SousObjetAuditable,
                        ObjectifOperationnelControle = risque.ObjectifOperationnelControle ?? string.Empty,
                        Risque = risque.Risque,
                        BonnePratique = risque.BonnePratique,
                        Likelihood = risque.Likelihood,
                        Impact = risque.Impact,
                        Evaluation = risque.Evaluation,
                        TypeControle = risque.TypeControle,
                        DecisionStatus = RiskDecisionStatus.Brouillon,
                    });
                }
            }
        }

        await riskEntryRepository.ReplaceForMissionAsync(missionId, entries, ct);

        return entries.Select(MapToDto).ToList();
    }

    public async Task<RiskEntryResponseDto> CreateAsync(
        Guid missionId, CreateRiskEntryRequestDto request, CancellationToken ct = default)
    {
        var mission = await missionRepository.GetByIdAsync(missionId, ct)
            ?? throw new KeyNotFoundException("Mission introuvable.");

        var entry = new RiskEntry
        {
            Id = Guid.NewGuid(),
            MissionId = mission.Id,
            RequestId = "manuel",
            ObjetAuditable = request.ObjetAuditable,
            SousObjetAuditable = request.SousObjetAuditable,
            ObjectifOperationnelControle = request.ObjectifOperationnelControle,
            Risque = request.Risque,
            BonnePratique = request.BonnePratique,
            Likelihood = request.Likelihood,
            Impact = request.Impact,
            Evaluation = request.Evaluation,
            TypeControle = request.TypeControle,
            DecisionStatus = RiskDecisionStatus.Brouillon,
        };

        await riskEntryRepository.AddAsync(entry, ct);
        await riskEntryRepository.SaveChangesAsync(ct);

        return MapToDto(entry);
    }

    public async Task<IReadOnlyList<RiskEntryResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken ct = default)
    {
        var entries = await riskEntryRepository.GetByMissionIdAsync(missionId, ct);
        return entries.Select(MapToDto).ToList();
    }
    
    public async Task<RiskEntryResponseDto> UpdateDecisionStatusAsync(Guid riskEntryId, string status, CancellationToken ct = default)
{
    if (!Enum.TryParse<RiskDecisionStatus>(status, out var parsedStatus))
        throw new ArgumentException("Statut invalide.");

    await riskEntryRepository.UpdateDecisionStatusAsync(riskEntryId, parsedStatus, ct);
    var entry = await riskEntryRepository.GetByIdAsync(riskEntryId, ct)
        ?? throw new KeyNotFoundException("Risque introuvable après mise à jour.");
    return MapToDto(entry);
}

    private static RiskEntryResponseDto MapToDto(RiskEntry r) => new()
    {
        Id = r.Id,
        ObjetAuditable = r.ObjetAuditable,
        SousObjetAuditable = r.SousObjetAuditable,
        ObjectifOperationnelControle = r.ObjectifOperationnelControle,
        Risque = r.Risque,
        BonnePratique = r.BonnePratique,
        Evaluation = r.Evaluation,
        DecisionStatus = r.DecisionStatus.ToString(),
    };

}