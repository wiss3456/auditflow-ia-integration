using System.Text;
using AuditFlow.Api.Configuration;
using AuditFlow.Api.Data;
using AuditFlow.Api.Entities;
using AuditFlow.Api.Repositories.Implementations;
using AuditFlow.Api.Repositories.Interfaces;
using AuditFlow.Api.Services.Implementations;
using AuditFlow.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AuditFlow.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddAuditFlowAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ClockSkew = TimeSpan.Zero,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
                    ValidateAudience = true,
                    ValidateIssuer = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidIssuer = jwtOptions.Issuer
                };
            });

        return services;
    }

    public static IServiceCollection AddAuditFlowPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("PostgresConnection")
                               ?? throw new InvalidOperationException("La chaine de connexion 'PostgresConnection' est introuvable.");

        services.AddDbContext<AuditFlowDbContext>(options => options.UseNpgsql(connectionString));
        return services;
    }

    public static IServiceCollection AddAuditFlowCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AuditFlowFrontend", policy =>
            {
                policy
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowAnyOrigin();
            });
        });

        return services;
    }

    public static IServiceCollection AddAuditFlowRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IMissionRepository, MissionRepository>();
        services.AddScoped<IFollowUpActionRepository, FollowUpActionRepository>();
        return services;
    }

    public static IServiceCollection AddAuditFlowServices(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IMissionService, MissionService>();
        services.AddScoped<IFollowUpActionService, FollowUpActionService>();
        services.AddScoped<IUserService, UserService>();
        return services;
    }

    public static IServiceCollection AddAuditFlowOpenApi(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "AuditFlow API",
                Version = "v1"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
                In = ParameterLocation.Header,
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}
