using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartPetAPI.Data;
using SmartPetAPI.Models;

namespace SmartPetAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly PasswordHasher<User> _hasher;

        public AuthController(ApiDbContext context)
        {
            _context = context;
            _hasher = new PasswordHasher<User>();
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email and password are required." });

            if (dto.Password.Length < 8)
                return BadRequest(new { message = "Password must be at least 8 characters long." });

            // Check if email already exists in SQL Server
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (existingUser != null)
                return BadRequest(new { message = "An account with this email already exists." });

            var user = new User
            {
                Email = dto.Email.Trim().ToLower(),
                FirstName = dto.FirstName.Trim(),
                LastName = dto.LastName.Trim(),
                CreatedAt = DateTime.Now
            };

            // Cryptographically hash and salt the password
            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully.",
                user = new { user.Id, user.Email, user.FirstName, user.LastName }
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Email and password are required." });

            // Look up user in SQL Server
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password." });

            // Verify the cryptographically hashed password
            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(new
            {
                message = "Login successful.",
                user = new { user.Id, user.Email, user.FirstName, user.LastName }
            });
        }
    }

    public class RegisterDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}