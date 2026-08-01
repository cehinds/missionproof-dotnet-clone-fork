var publishedWebRoot = Path.Combine(AppContext.BaseDirectory, "wwwroot");
var repositoryWebRoot = Path.GetFullPath(
    Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "dist", "client"));
var webRoot = File.Exists(Path.Combine(publishedWebRoot, "index.html"))
    ? publishedWebRoot
    : repositoryWebRoot;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
    WebRootPath = webRoot,
});

builder.Services.AddProblemDetails();

var app = builder.Build();

if (!File.Exists(Path.Combine(webRoot, "index.html")))
{
    throw new DirectoryNotFoundException(
        $"The frontend build was not found at '{webRoot}'. Run 'dotnet build MissionProof.slnx' first.");
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
}

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => TypedResults.Ok(new HealthResponse(
    Status: "ok",
    Service: "MissionProof.Web",
    Framework: ".NET 10")));

app.MapFallbackToFile("index.html");

app.Run();

public sealed record HealthResponse(string Status, string Service, string Framework);

public partial class Program;
