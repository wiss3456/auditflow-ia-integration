using AuditFlow.Api.DTOs.FollowUpActions;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Enums;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Interfaces;

namespace AuditFlow.Api.Services.Implementations;

public sealed class FollowUpActionService(
    IFollowUpActionRepository followUpActionRepository,
    IMissionRepository missionRepository,
    IUserRepository userRepository) : IFollowUpActionService
{
    public async Task<FollowUpActionResponseDto> AssignUserAsync(Guid actionId, Guid assignedUserId, CancellationToken cancellationToken = default)
    {
        var action = await followUpActionRepository.GetByIdAsync(actionId, cancellationToken)
                     ?? throw new KeyNotFoundException("FollowUpAction introuvable.");

        var assignedUser = await userRepository.GetByIdAsync(assignedUserId, cancellationToken)
                          ?? throw new KeyNotFoundException("Utilisateur assigne introuvable.");

        action.AssignedUserId = assignedUserId;
        action.AssignedUser = assignedUser;
        await followUpActionRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(action);
    }

    public async Task<FollowUpActionResponseDto> CreateAsync(CreateFollowUpActionRequestDto request, Guid currentUserId, CancellationToken cancellationToken = default)
    {
        if (request.EndDate < request.StartDate)
        {
            throw new InvalidOperationException("La date de fin doit etre superieure ou egale a la date de debut.");
        }

        var mission = await missionRepository.GetByIdAsync(request.MissionId, cancellationToken)
                      ?? throw new KeyNotFoundException("Mission introuvable.");

        User? assignedUser = null;

        if (request.AssignedUserId.HasValue)
        {
            assignedUser = await userRepository.GetByIdAsync(request.AssignedUserId.Value, cancellationToken)
                           ?? throw new KeyNotFoundException("Utilisateur assigne introuvable.");
        }

        var createdBy = await userRepository.GetByIdAsync(currentUserId, cancellationToken)
                        ?? throw new KeyNotFoundException("Utilisateur createur introuvable.");

        var parsedBoardStatus = ParseBoardStatus(request.BoardStatus);
        var parsedEvaluation = ParseEvaluation(request.Evaluation);
        var parsedRecommendationStatus = ParseRecommendationStatus(request.RecommendationStatus);

        if (parsedRecommendationStatus == FollowUpRecommendationStatus.Accepted)
        {
            parsedBoardStatus = FollowUpActionBoardStatus.NotDue;
        }

        var action = new FollowUpAction
        {
            ActionDetail = request.ActionDetail?.Trim(),
            AssignedUserId = assignedUser?.Id,
            BoardStatus = parsedBoardStatus,
            CreatedByUserId = createdBy.Id,
            DeadlineLabel = request.DeadlineLabel?.Trim(),
            Description = request.Description?.Trim(),
            EndDate = request.EndDate,
            Evaluation = parsedEvaluation,
            Id = Guid.NewGuid(),
            MissionId = mission.Id,
            OwnerDisplayName = string.IsNullOrWhiteSpace(request.OwnerDisplayName) ? assignedUser?.FullName : request.OwnerDisplayName.Trim(),
            Recommendation = request.Recommendation?.Trim(),
            RecommendationNumber = request.RecommendationNumber?.Trim(),
            RecommendationStatus = parsedRecommendationStatus,
            Remarks = request.Remarks?.Trim(),
            StartDate = request.StartDate,
            Status = MapBoardStatusToProgressStatus(parsedBoardStatus),
            Title = request.Title.Trim()
        };

        await followUpActionRepository.AddAsync(action, cancellationToken);
        await followUpActionRepository.SaveChangesAsync(cancellationToken);

        action.CreatedByUser = createdBy;
        action.AssignedUser = assignedUser;

        return MapToResponse(action);
    }

    public async Task<IReadOnlyList<FollowUpActionResponseDto>> GetByMissionAsync(Guid missionId, CancellationToken cancellationToken = default)
    {
        var mission = await missionRepository.GetByIdAsync(missionId, cancellationToken);

        if (mission is null)
        {
            throw new KeyNotFoundException("Mission introuvable.");
        }

        var actions = await followUpActionRepository.GetByMissionIdAsync(missionId, cancellationToken);
        return actions.Select(MapToResponse).ToList();
    }

    public async Task<IReadOnlyList<FollowUpActionResponseDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var actions = await followUpActionRepository.GetAllAsync(cancellationToken);
        return actions.Select(MapToResponse).ToList();
    }

    public async Task DeleteAsync(Guid actionId, CancellationToken cancellationToken = default)
    {
        var action = await followUpActionRepository.GetByIdAsync(actionId, cancellationToken)
                     ?? throw new KeyNotFoundException("FollowUpAction introuvable.");

        followUpActionRepository.Remove(action);
        await followUpActionRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<FollowUpActionResponseDto> UpdateBoardStatusAsync(
        Guid actionId,
        string boardStatus,
        Guid currentUserId,
        UserRole currentUserRole,
        CancellationToken cancellationToken = default)
    {
        var action = await followUpActionRepository.GetByIdAsync(actionId, cancellationToken)
                     ?? throw new KeyNotFoundException("FollowUpAction introuvable.");

        EnsureCanUpdate(action, currentUserId, currentUserRole);

        action.BoardStatus = ParseBoardStatus(boardStatus);
        action.Status = MapBoardStatusToProgressStatus(action.BoardStatus);
        await followUpActionRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(action);
    }

    public async Task<FollowUpActionResponseDto> UpdateRecommendationStatusAsync(
        Guid actionId,
        string recommendationStatus,
        CancellationToken cancellationToken = default)
    {
        var action = await followUpActionRepository.GetByIdAsync(actionId, cancellationToken)
                     ?? throw new KeyNotFoundException("FollowUpAction introuvable.");

        action.RecommendationStatus = ParseRecommendationStatus(recommendationStatus);

        if (action.RecommendationStatus == FollowUpRecommendationStatus.Accepted)
        {
            action.BoardStatus = FollowUpActionBoardStatus.NotDue;
            action.Status = MapBoardStatusToProgressStatus(action.BoardStatus);
        }

        await followUpActionRepository.SaveChangesAsync(cancellationToken);
        return MapToResponse(action);
    }

    public async Task<FollowUpActionResponseDto> UpdateStatusAsync(
        Guid actionId,
        FollowUpActionStatus status,
        Guid currentUserId,
        UserRole currentUserRole,
        CancellationToken cancellationToken = default)
    {
        var action = await followUpActionRepository.GetByIdAsync(actionId, cancellationToken)
                     ?? throw new KeyNotFoundException("FollowUpAction introuvable.");

        EnsureCanUpdate(action, currentUserId, currentUserRole);

        action.Status = status;
        action.BoardStatus = MapProgressStatusToBoardStatus(status);
        await followUpActionRepository.SaveChangesAsync(cancellationToken);

        return MapToResponse(action);
    }

    private static void EnsureCanUpdate(FollowUpAction action, Guid currentUserId, UserRole currentUserRole)
    {
        var canUpdate =
            currentUserRole == UserRole.Admin ||
            currentUserRole == UserRole.Manager ||
            action.AssignedUserId == currentUserId ||
            action.CreatedByUserId == currentUserId;

        if (!canUpdate)
        {
            throw new UnauthorizedAccessException("Tu n'es pas autorise a mettre a jour cette action.");
        }
    }

    private static FollowUpActionBoardStatus ParseBoardStatus(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            "not-due" => FollowUpActionBoardStatus.NotDue,
            "in-progress" => FollowUpActionBoardStatus.InProgress,
            "at-risk" => FollowUpActionBoardStatus.AtRisk,
            "completed" => FollowUpActionBoardStatus.Completed,
            _ => FollowUpActionBoardStatus.Planning,
        };
    }

    private static FollowUpActionEvaluation ParseEvaluation(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            "critique" => FollowUpActionEvaluation.Critique,
            "mineur" => FollowUpActionEvaluation.Mineur,
            _ => FollowUpActionEvaluation.Modere,
        };
    }

    private static FollowUpRecommendationStatus ParseRecommendationStatus(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            "accepted" => FollowUpRecommendationStatus.Accepted,
            "not-accepted" => FollowUpRecommendationStatus.NotAccepted,
            _ => FollowUpRecommendationStatus.InStudy,
        };
    }

    private static FollowUpActionStatus MapBoardStatusToProgressStatus(FollowUpActionBoardStatus boardStatus)
    {
        return boardStatus switch
        {
            FollowUpActionBoardStatus.Completed => FollowUpActionStatus.Done,
            FollowUpActionBoardStatus.InProgress or FollowUpActionBoardStatus.AtRisk => FollowUpActionStatus.InProgress,
            _ => FollowUpActionStatus.NotStarted,
        };
    }

    private static FollowUpActionBoardStatus MapProgressStatusToBoardStatus(FollowUpActionStatus status)
    {
        return status switch
        {
            FollowUpActionStatus.Done => FollowUpActionBoardStatus.Completed,
            FollowUpActionStatus.InProgress => FollowUpActionBoardStatus.InProgress,
            _ => FollowUpActionBoardStatus.Planning,
        };
    }

    private static FollowUpActionResponseDto MapToResponse(FollowUpAction action)
    {
        return new FollowUpActionResponseDto
        {
            ActionDetail = action.ActionDetail,
            AssignedUserId = action.AssignedUserId,
            AssignedUserName = action.AssignedUser?.FullName,
            BoardStatus = action.BoardStatus switch
            {
                FollowUpActionBoardStatus.NotDue => "not-due",
                FollowUpActionBoardStatus.InProgress => "in-progress",
                FollowUpActionBoardStatus.AtRisk => "at-risk",
                FollowUpActionBoardStatus.Completed => "completed",
                _ => "planning",
            },
            CreatedAtUtc = action.CreatedAt,
            CreatedByUserId = action.CreatedByUserId,
            CreatedByUserName = action.CreatedByUser?.FullName ?? string.Empty,
            DeadlineLabel = action.DeadlineLabel,
            Description = action.Description,
            EndDate = action.EndDate,
            Evaluation = action.Evaluation.ToString(),
            Id = action.Id,
            MissionId = action.MissionId,
            OwnerDisplayName = action.OwnerDisplayName,
            Recommendation = action.Recommendation,
            RecommendationNumber = action.RecommendationNumber,
            RecommendationStatus = action.RecommendationStatus switch
            {
                FollowUpRecommendationStatus.Accepted => "accepted",
                FollowUpRecommendationStatus.NotAccepted => "not-accepted",
                _ => "in-study",
            },
            Remarks = action.Remarks,
            StartDate = action.StartDate,
            Status = action.Status.ToString(),
            Title = action.Title,
            UpdatedAtUtc = action.UpdatedAt
        };
    }
}
