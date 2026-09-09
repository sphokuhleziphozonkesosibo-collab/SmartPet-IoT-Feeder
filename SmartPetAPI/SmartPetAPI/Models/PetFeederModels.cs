using System;
using System.ComponentModel.DataAnnotations;

namespace SmartPetAPI.Models
{
    // Real Users stored in SQL Server
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty; // Cryptographically hashed
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    // Real-time state of your physical hardware & sensors
    public class DeviceStatus
    {
        [Key]
        public int Id { get; set; }
        public string DeviceName { get; set; } = "SmartPet Feeder v1";

        // --- SENSORS ---
        public double FoodLevelPercentage { get; set; }
        public double WaterLevelPercentage { get; set; }
        public int TdsValue { get; set; }
        public double CurrentBowlWeight { get; set; }
        public bool MotionDetected { get; set; }

        // --- ACTUATORS ---
        public bool RelayActive { get; set; }
        public bool BuzzerActive { get; set; }
        public string FeedingMode { get; set; } = "Automatic";
        public bool IsOnline { get; set; }
        public DateTime LastSeen { get; set; }

        // --- COMMAND QUEUE ---
        public string? PendingCommand { get; set; }
        public double LastRequestedAmount { get; set; }

        // --- CAMERA ---
        public string? LatestCameraImageUrl { get; set; }
        public DateTime? LastPhotoTimestamp { get; set; }
    }

    // Feeding records stored in SQL Server
    public class FeedingRecord
    {
        [Key]
        public int Id { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string PetName { get; set; } = "Buddy";
        public double RequestedAmount { get; set; }
        public double ActualAmount { get; set; }
        public string Mode { get; set; }
        public string? PhotoUrl { get; set; }
    }

    // Pet profiles stored in SQL Server
    public class PetProfile
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Breed { get; set; }
        public int DailyTarget { get; set; }
    }

    // Meal schedules stored in SQL Server
    public class MealSchedule
    {
        [Key]
        public int Id { get; set; }
        public string Time { get; set; } = "08:00";
        public int Amount { get; set; } = 30;
        public string Days { get; set; } = "1,2,3,4,5,6,7";
        public bool IsEnabled { get; set; } = true;
        public DateTime? LastTriggeredDate { get; set; }
    }
}