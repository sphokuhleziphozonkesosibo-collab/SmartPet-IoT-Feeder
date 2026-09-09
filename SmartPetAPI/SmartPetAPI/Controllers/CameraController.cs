using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartPetAPI.Data;

namespace SmartPetAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CameraController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly IWebHostEnvironment _env;

        public CameraController(ApiDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // POST: api/camera/upload
        // Notice "(IFormFile file)" below -> This forces Swagger to show the "Choose File" button!
        [HttpPost("upload")]
        public async Task<IActionResult> UploadSnapshot(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No photo received.");

            // Ensure the storage folder exists inside wwwroot/captures
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRoot, "captures");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"pet_camera_{DateTime.Now:yyyyMMdd_HHmmss}.jpg";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/captures/{fileName}";

            // Save photo URL in the database
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status != null)
            {
                status.LatestCameraImageUrl = relativeUrl;
                status.LastPhotoTimestamp = DateTime.Now;
                await _context.SaveChangesAsync();
            }

            return Ok(new { url = relativeUrl, message = "Photo stored successfully" });
        }

        // GET: api/camera/latest
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestPhoto()
        {
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status == null || string.IsNullOrEmpty(status.LatestCameraImageUrl))
                return NotFound("No camera capture available.");

            return Ok(new
            {
                imageUrl = status.LatestCameraImageUrl,
                timestamp = status.LastPhotoTimestamp
            });
        }
    }
}