# AuditFlow Backend API

Backend .NET 8 independant du frontend existant.

## Stack

- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- JWT

## Projet

- `backend/AuditFlow.Api`

## Configuration

La chaine de connexion PostgreSQL est lue depuis :

```json
{
  "ConnectionStrings": {
    "PostgresConnection": "Host=localhost;Port=5432;Database=AuditFlow;Username=postgres;Password=ehei"
  }
}
```

## Commandes

Depuis `backend/AuditFlow.Api` :

```powershell
dotnet restore
dotnet build
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```
