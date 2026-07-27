namespace AuditFlow.Api.DTOs.Verification;

public sealed record UpdateVerificationTestRequestDto(
    string TestNumber,
    string Tache,
    string Objectif,
    string Methodologie,
    string Auditor,
    string Status,
    string StartDate,
    string EndDate,
    string Comments,
    string Action,
    bool IsNonConformity
);