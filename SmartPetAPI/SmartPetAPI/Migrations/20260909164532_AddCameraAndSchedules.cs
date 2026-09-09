using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPetAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCameraAndSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "FeedingHistory",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "BuzzerActive",
                table: "DeviceStatuses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "FeedingMode",
                table: "DeviceStatuses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastPhotoTimestamp",
                table: "DeviceStatuses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LatestCameraImageUrl",
                table: "DeviceStatuses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Schedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Time = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Amount = table.Column<int>(type: "int", nullable: false),
                    Days = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LastTriggeredDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Schedules");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "FeedingHistory");

            migrationBuilder.DropColumn(
                name: "BuzzerActive",
                table: "DeviceStatuses");

            migrationBuilder.DropColumn(
                name: "FeedingMode",
                table: "DeviceStatuses");

            migrationBuilder.DropColumn(
                name: "LastPhotoTimestamp",
                table: "DeviceStatuses");

            migrationBuilder.DropColumn(
                name: "LatestCameraImageUrl",
                table: "DeviceStatuses");
        }
    }
}
