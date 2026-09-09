using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartPetAPI.Data;
using SmartPetAPI.Models;

namespace SmartPetAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public DashboardController(ApiDbContext context)
        {
            _context = context;
        }

        // 1. STATUS & TELEMETRY (With 60-second offline detection)
        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status == null)
            {
                status = new DeviceStatus { IsOnline = false, LastSeen = DateTime.Now };
                _context.DeviceStatuses.Add(status);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Auto-mark OFFLINE if hardware hasn't synced in over 60 seconds
                if ((DateTime.Now - status.LastSeen).TotalSeconds > 60)
                {
                    status.IsOnline = false;
                    await _context.SaveChangesAsync();
                }
            }
            return Ok(status);
        }

        // 2. SWITCH FEEDING MODE (Automatic vs Manual)
        [HttpPost("mode")]
        public async Task<IActionResult> SetMode([FromBody] ModeRequest req)
        {
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status == null) return NotFound();

            status.FeedingMode = req.Mode;
            await _context.SaveChangesAsync();
            return Ok(new { message = $"Feeding mode set to {req.Mode}" });
        }

        // 3. DISPENSE FOOD (Sends Servo command + pet name)
        [HttpPost("feed")]
        public async Task<IActionResult> RequestFeed([FromBody] FeedRequest req)
        {
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status == null) return NotFound();

            status.PendingCommand = $"DISPENSE:{req.Amount}:{req.PetName}";
            status.LastRequestedAmount = req.Amount;

            // Queue pending record in history
            _context.FeedingHistory.Add(new FeedingRecord
            {
                PetName = string.IsNullOrEmpty(req.PetName) ? "Buddy" : req.PetName,
                RequestedAmount = req.Amount,
                ActualAmount = 0, // Will be filled once HX711 confirms
                Mode = req.Mode ?? "Manual",
                Timestamp = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Dispense command queued for {req.PetName}" });
        }

        // 4. RELAY CONTROL (Water Pump ON / OFF)
        [HttpPost("relay")]
        public async Task<IActionResult> ToggleRelay([FromBody] RelayRequest req)
        {
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status == null) return NotFound();

            status.PendingCommand = req.TurnOn ? "RELAY:ON" : "RELAY:OFF";
            status.RelayActive = req.TurnOn;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Relay command queued: {(req.TurnOn ? "ON" : "OFF")}" });
        }

        // 5. TARE SCALE (Zero the HX711 Load Cell)
        [HttpPost("tare")]
        public async Task<IActionResult> TareScale()
        {
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status == null) return NotFound();

            status.PendingCommand = "SCALE:TARE";
            await _context.SaveChangesAsync();
            return Ok(new { message = "Tare command sent to HX711" });
        }

        // 6. PET PROFILES
        [HttpGet("pets")]
        public async Task<IActionResult> GetPets()
        {
            var pets = await _context.Pets.ToListAsync();
            return Ok(pets);
        }

        [HttpPost("pets")]
        public async Task<IActionResult> AddPet([FromBody] PetProfile pet)
        {
            _context.Pets.Add(pet);
            await _context.SaveChangesAsync();
            return Ok(pet);
        }

        // 7. MEAL SCHEDULES
        [HttpGet("schedules")]
        public async Task<IActionResult> GetSchedules()
        {
            var schedules = await _context.Schedules.OrderBy(s => s.Time).ToListAsync();
            return Ok(schedules);
        }

        [HttpPost("schedules")]
        public async Task<IActionResult> AddSchedule([FromBody] MealSchedule schedule)
        {
            _context.Schedules.Add(schedule);
            await _context.SaveChangesAsync();
            return Ok(schedule);
        }

        [HttpDelete("schedules/{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null) return NotFound();

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Schedule deleted" });
        }

        // 8. HISTORY LOGS
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var logs = await _context.FeedingHistory
                .OrderByDescending(h => h.Timestamp)
                .Take(25)
                .ToListAsync();
            return Ok(logs);
        }
    }

    public class FeedRequest
    {
        public int Amount { get; set; }
        public string PetName { get; set; } = "Buddy";
        public string Mode { get; set; } = "Manual";
    }

    public class ModeRequest { public string Mode { get; set; } = "Automatic"; }
    public class RelayRequest { public bool TurnOn { get; set; } }
}