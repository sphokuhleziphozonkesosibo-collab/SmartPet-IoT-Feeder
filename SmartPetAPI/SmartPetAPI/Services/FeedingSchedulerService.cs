using Microsoft.EntityFrameworkCore;
using SmartPetAPI.Data;

namespace SmartPetAPI.Services
{
    public class FeedingSchedulerService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<FeedingSchedulerService> _logger;

        public FeedingSchedulerService(IServiceProvider serviceProvider, ILogger<FeedingSchedulerService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SmartPet Automated Feeding Scheduler is running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var context = scope.ServiceProvider.GetRequiredService<ApiDbContext>();
                        var now = DateTime.Now;
                        var currentTimeStr = now.ToString("HH:mm");
                        var todayDate = now.Date;

                        // Calculate current day of week (Monday = 1 ... Sunday = 7)
                        int currentDayOfWeek = ((int)now.DayOfWeek == 0) ? 7 : (int)now.DayOfWeek;
                        string dayString = currentDayOfWeek.ToString();

                        var device = await context.DeviceStatuses.FirstOrDefaultAsync(stoppingToken);

                        // Only run automatic schedules if feeder is in Automatic mode
                        if (device != null && device.FeedingMode == "Automatic")
                        {
                            var dueSchedules = await context.Schedules
                                .Where(s => s.IsEnabled && s.Time == currentTimeStr)
                                .ToListAsync(stoppingToken);

                            foreach (var schedule in dueSchedules)
                            {
                                // Check if today's day of the week is active in the schedule (e.g. "1,2,3,4,5")
                                var activeDays = schedule.Days.Split(',', StringSplitOptions.RemoveEmptyEntries);
                                bool isTodayActive = activeDays.Contains(dayString);

                                if (isTodayActive && (schedule.LastTriggeredDate == null || schedule.LastTriggeredDate.Value.Date != todayDate))
                                {
                                    _logger.LogInformation($"[SCHEDULE TRIGGERED] Meal at {schedule.Time} for {schedule.Amount}g on Day {currentDayOfWeek}");

                                    // 1. Activate the physical buzzer ring to call the dog
                                    device.BuzzerActive = true;

                                    // 2. Queue command for the ESP32 and ESP-CAM
                                    device.PendingCommand = $"CALL_PET_AND_RECOGNIZE:{schedule.Amount}";
                                    device.LastRequestedAmount = schedule.Amount;

                                    schedule.LastTriggeredDate = now;
                                    await context.SaveChangesAsync(stoppingToken);
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred in FeedingSchedulerService.");
                }

                // Check clock every 30 seconds
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }
}