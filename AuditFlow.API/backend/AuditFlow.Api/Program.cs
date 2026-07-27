using System.Text.Json.Serialization;
using AuditFlow.Api.Data;
using AuditFlow.Api.Extensions;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuditFlowPersistence(builder.Configuration)
    .AddAuditFlowCors()
    .AddAuditFlowAuthentication(builder.Configuration)
    .AddAuditFlowServices()
    .AddAuditFlowRepositories()
    .AddAuditFlowAiClients(builder.Configuration)
    .AddAuditFlowOpenApi();

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var firstError = context.ModelState.Values.SelectMany((entry) => entry.Errors).Select((error) => error.ErrorMessage).FirstOrDefault();
        var message = string.IsNullOrWhiteSpace(firstError) ? "Requete invalide." : firstError;
        return new BadRequestObjectResult(new { message });
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AuditFlowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
