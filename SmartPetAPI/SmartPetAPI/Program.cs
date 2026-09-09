using Microsoft.EntityFrameworkCore;
using SmartPetAPI.Data;
using SmartPetAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Connection
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Register Automated Background Worker (Option 3)
builder.Services.AddHostedService<FeedingSchedulerService>();

// 3. CORS Bridge
builder.Services.AddCors(options => {
    options.AddPolicy("AllowDashboard",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Enable serving images from wwwroot/captures
// Enable CORS for static files and API endpoints
app.UseCors("AllowDashboard");

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
    }
});
app.UseAuthorization();
app.MapControllers();
app.Run();