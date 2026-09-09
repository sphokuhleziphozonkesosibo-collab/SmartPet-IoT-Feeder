using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartPetAPI.Data;
using SmartPetAPI.Models;

namespace SmartPetAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HardwareController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public HardwareController(ApiDbContext context)
        {
            _context = context;
        }

        // POST: api/Hardware/sync
        // The ESP32 calls this every few seconds to report ALL physical sensors
        [HttpPost("sync")]
        public async Task<IActionResult> SyncHardware([FromBody] HardwareSyncDto data)
        {
            var status = await _context.DeviceStatuses.FirstOrDefaultAsync();
            if (status == null)
            {
                // Auto-seed initial status if physical ESP32 connects before anyone opens web dashboard
                status = new DeviceStatus
                {
                    DeviceName = "SmartPet Feeder v1",
                    IsOnline = true,
                    LastSeen = DateTime.Now
                };
                _context.DeviceStatuses.Add(status);
                await _context.SaveChangesAsync();
            }

            // 1. Store sensor telemetry in database
            status.FoodLevelPercentage = data.FoodLevel;       // Ultrasonic (%)
            status.WaterLevelPercentage = data.WaterLevel;     // Water sensor (%)
            status.TdsValue = data.TdsValue;                   // TDS sensor (PPM)
            status.CurrentBowlWeight = data.BowlWeight;        // HX711 Load Cell (Grams)
            status.MotionDetected = data.MotionDetected;       // PIR Motion Sensor
            status.RelayActive = data.RelayIsOn;               // Relay state (Water pump)
            status.LastSeen = DateTime.Now;
            status.IsOnline = true;

            // 2. If the servo just finished dispensing, update the real measured grams from HX711
            if (data.DispensedWeightConfirm > 0)
            {
                var latestPendingLog = await _context.FeedingHistory
                    .OrderByDescending(h => h.Timestamp)
                    .FirstOrDefaultAsync();

                if (latestPendingLog != null && latestPendingLog.ActualAmount == 0)
                {
                    latestPendingLog.ActualAmount = data.DispensedWeightConfirm;
                }
                else
                {
                    _context.FeedingHistory.Add(new FeedingRecord
                    {
                        RequestedAmount = status.LastRequestedAmount,
                        ActualAmount = data.DispensedWeightConfirm,
                        Mode = "Hardware Verified",
                        Timestamp = DateTime.Now
                    });
                }
            }

            // 3. Deliver pending command to the ESP32 (Servo, Relay, Tare, or Buzzer)
            string cmd = status.PendingCommand ?? "IDLE";
            status.PendingCommand = null; // Clear command so it only executes ONCE

            // Turn off buzzer flag once hardware acknowledges the sync
            if (status.BuzzerActive)
            {
                status.BuzzerActive = false;
            }

            await _context.SaveChangesAsync();
            return Ok(new { command = cmd });
        }
    }

    public class HardwareSyncDto
    {
        public double FoodLevel { get; set; }              // Ultrasonic %
        public double WaterLevel { get; set; }             // Water %
        public int TdsValue { get; set; }                  // TDS PPM
        public double BowlWeight { get; set; }             // HX711 Grams
        public bool MotionDetected { get; set; }           // PIR Motion Sensor
        public bool RelayIsOn { get; set; }                // Relay State
        public double DispensedWeightConfirm { get; set; }  // Grams weighed after dispense
    }
}