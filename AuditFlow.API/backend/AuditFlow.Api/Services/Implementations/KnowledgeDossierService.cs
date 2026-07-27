using AuditFlow.Api.Configuration;
using AuditFlow.Api.DTOs.Knowledge;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Interfaces;
using AuditFlow.Api.Services.Models;
using AuditFlow.Api.Services.Utils;
using Microsoft.Extensions.Options;

namespace AuditFlow.Api.Services.Implementations;

public sealed class KnowledgeDossierService(
    HttpClient httpClient,
    IOptions<AiServicesOptions> aiOptions,
    IKnowledgeDossierRepository knowledgeDossierRepository,
    IMissionRepository missionRepository) : IKnowledgeDossierService
{
    // création manuelle pour le test
    public async Task<KnowledgeDossierResponseDto> CreateAsync(
        Guid missionId, CreateKnowledgeDossierRequestDto request, CancellationToken ct = default)
    {
        var mission = await missionRepository.GetByIdAsync(missionId, ct)
            ?? throw new KeyNotFoundException("Mission introuvable.");

        var dossier = new KnowledgeDossier
        {
            Id = Guid.NewGuid(),
            MissionId = mission.Id,
            DimensionKey = request.DimensionKey,
            Summary = request.Summary,
            ContentHash = ContentHasher.Compute(request.Summary),
            LastGeneratedAt = DateTime.UtcNow,
            Articles = request.Articles.Select(a => new KnowledgeArticle
            {
                Id = Guid.NewGuid(),
                ArticleId = a.ArticleId,
                Title = a.Title,
                Content = a.Content,
                CitationsJson = "[]",
            }).ToList(),
        };

        await knowledgeDossierRepository.AddAsync(dossier, ct);
        await knowledgeDossierRepository.SaveChangesAsync(ct);

        return MapToDto(dossier);
    }

    //uniquement la dernière version de chaque dimension
    public async Task<IReadOnlyList<KnowledgeDossierResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken ct = default)
    {
        var dossiers = await knowledgeDossierRepository.GetByMissionIdAsync(missionId, ct);

        var latestPerDimension = dossiers
            .GroupBy(d => d.DimensionKey)
            .Select(g => g.OrderByDescending(d => d.LastGeneratedAt).First());

        return latestPerDimension.Select(MapToDto).ToList();
    }

    // vrai appel à Knowledge_API, avec déduplication par hash et historique conservé 
    public async Task<IReadOnlyList<KnowledgeDossierResponseDto>> GenerateAsync(Guid missionId, CancellationToken ct = default)
{
    var mission = await missionRepository.GetByIdAsync(missionId, ct)
        ?? throw new KeyNotFoundException("Mission introuvable.");

   
    var existingDossiers = await knowledgeDossierRepository.GetByMissionIdAsync(missionId, ct);
    if (existingDossiers.Count > 0)
    {
        var latestPerDimension = existingDossiers
            .GroupBy(d => d.DimensionKey)
            .Select(g => g.OrderByDescending(d => d.LastGeneratedAt).First());

        return latestPerDimension.Select(MapToDto).ToList();
    }


    httpClient.DefaultRequestHeaders.Remove("X-API-Key");
    httpClient.DefaultRequestHeaders.Add("X-API-Key", aiOptions.Value.KnowledgeApiKey);
    

        var missionTopic = Uri.EscapeDataString(mission.Title);
        var response = await httpClient.PostAsync(
            $"/initail_generation?mission_id={mission.Id}&mission_topic={missionTopic}", content: null, ct);
        response.EnsureSuccessStatusCode();

        var raw = await response.Content.ReadFromJsonAsync<KnowledgeApiRawResponse>(cancellationToken: ct)
            ?? throw new InvalidOperationException("Réponse vide de Knowledge_API.");

        var resultDossiers = new List<KnowledgeDossier>();

        foreach (var (dimensionKey, dossierRaw) in raw.KnowledgeDossier)
        {
            var hash = ContentHasher.Compute(dossierRaw.Summary);
            var existing = await knowledgeDossierRepository.FindByHashAsync(missionId, dimensionKey, hash, ct);

            if (existing is not null)
            {
                // contenu identique déjà en base : rien à recréer, juste "revu maintenant"
                existing.LastGeneratedAt = DateTime.UtcNow;
                resultDossiers.Add(existing);
                continue;
            }

            // contenu nouveau ou différent : nouvelle version ajoutée, les anciennes restent en base
            var dossier = new KnowledgeDossier
            {
                Id = Guid.NewGuid(),
                MissionId = missionId,
                DimensionKey = dimensionKey,
                Summary = dossierRaw.Summary,
                ContentHash = hash,
                LastGeneratedAt = DateTime.UtcNow,
                Articles = dossierRaw.Articles.Select(a => new KnowledgeArticle
                {
                    Id = Guid.NewGuid(),
                    ArticleId = a.ArticleId,
                    Title = a.Title,
                    Content = a.Content,
                    CitationsJson = System.Text.Json.JsonSerializer.Serialize(a.Citations),
                }).ToList(),
            };

            await knowledgeDossierRepository.AddAsync(dossier, ct);
            resultDossiers.Add(dossier);
        }

        await knowledgeDossierRepository.SaveChangesAsync(ct);

        return resultDossiers.Select(MapToDto).ToList();
    }

    private static KnowledgeDossierResponseDto MapToDto(KnowledgeDossier d) => new()
{
    Id = d.Id,
    DimensionKey = d.DimensionKey,
    Summary = d.Summary,
    Articles = d.Articles.Select(a => new KnowledgeArticleDto
    {
        ArticleId = a.ArticleId,
        Title = a.Title,
        Content = a.Content,
        Citations = System.Text.Json.JsonSerializer.Deserialize<List<string>>(a.CitationsJson) ?? new()
    }).ToList(),
};
}