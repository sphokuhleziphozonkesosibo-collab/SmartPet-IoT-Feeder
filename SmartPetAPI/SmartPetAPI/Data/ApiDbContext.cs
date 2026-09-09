using Microsoft.EntityFrameworkCore;
using SmartPetAPI.Models;

namespace SmartPetAPI.Data
{
    public class ApiDbContext : DbContext
    {
        public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } // Physical Users Table in SQL Server
        public DbSet<DeviceStatus> DeviceStatuses { get; set; }
        public DbSet<FeedingRecord> FeedingHistory { get; set; }
        public DbSet<PetProfile> Pets { get; set; }
        public DbSet<MealSchedule> Schedules { get; set; }
    }
}