using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AuditFlow.Api.Data;

public sealed class AuditFlowDbContextFactory : IDesignTimeDbContextFactory<AuditFlowDbContext>
{
    public AuditFlowDbContext CreateDbContext(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("PostgresConnection")
                               ?? throw new InvalidOperationException("La chaine de connexion 'PostgresConnection' est introuvable.");

        var optionsBuilder = new DbContextOptionsBuilder<AuditFlowDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new AuditFlowDbContext(optionsBuilder.Options);
    }
}
