using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using MissionProof.Web.Backend;

namespace MissionProof.Web;

public static class MissionProofApp
{
    public static WebApplication Build(
        string[] args,
        string? webRootOverride = null,
        string? environmentName = null,
        Action<WebApplicationBuilder>? configureBuilder = null)
    {
        var webRoot = webRootOverride ?? ResolveWebRoot();
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = args,
            ContentRootPath = AppContext.BaseDirectory,
            WebRootPath = webRoot,
            EnvironmentName = environmentName,
        });

        configureBuilder?.Invoke(builder);
        builder.Services.AddProblemDetails();
        builder.Services.AddSingleton<IMissionProofStore, InMemoryMissionProofStore>();
        builder.Services.AddSingleton<DeterministicEvidenceAnalyzer>();
        builder.Services.AddSingleton<MissionProofService>();

        var syntheticIdentityAllowed = builder.Environment.IsDevelopment()
            && builder.Configuration.GetValue<bool>("MissionProof:Development:AllowSyntheticIdentity");
        builder.Services.AddSingleton<ICurrentUserAccessor>(syntheticIdentityAllowed
            ? new DevelopmentCurrentUserAccessor()
            : new UnavailableCurrentUserAccessor());

        var app = builder.Build();

        if (!File.Exists(Path.Combine(webRoot, "index.html")))
        {
            throw new DirectoryNotFoundException(
                $"The frontend build was not found at '{webRoot}'. Run 'dotnet build MissionProof.slnx' first.");
        }

        app.UseExceptionHandler(handler => handler.Run(async context =>
        {
            var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";
            var problem = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "The request could not be completed.",
                Detail = "An unexpected server error occurred.",
                Type = "https://httpstatuses.com/500",
            };
            problem.Extensions["code"] = exception is OperationCanceledException
                ? "request_cancelled"
                : "unexpected_error";
            problem.Extensions["traceId"] = Activity.Current?.Id ?? context.TraceIdentifier;
            await context.Response.WriteAsJsonAsync(problem, cancellationToken: context.RequestAborted);
        }));

        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.MapGet("/api/health", () => TypedResults.Ok(new HealthResponse(
            Status: "ok",
            Service: "MissionProof.Web",
            Framework: ".NET 10")));
        app.MapMissionProofApi();
        app.Map("/api/{**path}", ApiEndpoints.ApiNotFound);
        app.MapFallbackToFile("index.html");

        return app;
    }

    private static string ResolveWebRoot()
    {
        var publishedWebRoot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
        if (File.Exists(Path.Combine(publishedWebRoot, "index.html")))
        {
            return publishedWebRoot;
        }

        var cursor = new DirectoryInfo(AppContext.BaseDirectory);
        while (cursor is not null)
        {
            var candidate = Path.Combine(cursor.FullName, "dist", "client");
            if (File.Exists(Path.Combine(candidate, "index.html")))
            {
                return candidate;
            }

            cursor = cursor.Parent;
        }

        return Path.GetFullPath(Path.Combine(
            AppContext.BaseDirectory, "..", "..", "..", "..", "..", "dist", "client"));
    }
}

public sealed record HealthResponse(string Status, string Service, string Framework);
