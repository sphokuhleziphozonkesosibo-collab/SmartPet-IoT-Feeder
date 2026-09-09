using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPetAPI.Migrations
{
    /// <inheritdoc />
    public partial class HardwareUpdateV1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Amount",
                table: "FeedingHistory",
                newName: "RequestedAmount");

            migrationBuilder.RenameColumn(
                name: "WaterLevel",
                table: "DeviceStatuses",
                newName: "WaterLevelPercentage");

            migrationBuilder.RenameColumn(
                name: "FoodLevel",
                table: "DeviceStatuses",
                newName: "LastRequestedAmount");

            migrationBuilder.AddColumn<double>(
                name: "ActualAmount",
                table: "FeedingHistory",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "CurrentBowlWeight",
                table: "DeviceStatuses",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "DeviceName",
                table: "DeviceStatuses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "FoodLevelPercentage",
                table: "DeviceStatuses",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<bool>(
                name: "RelayActive",
                table: "DeviceStatuses",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualAmount",
                table: "FeedingHistory");

            migrationBuilder.DropColumn(
                name: "CurrentBowlWeight",
                table: "DeviceStatuses");

            migrationBuilder.DropColumn(
                name: "DeviceName",
                table: "DeviceStatuses");

            migrationBuilder.DropColumn(
                name: "FoodLevelPercentage",
                table: "DeviceStatuses");

            migrationBuilder.DropColumn(
                name: "RelayActive",
                table: "DeviceStatuses");

            migrationBuilder.RenameColumn(
                name: "RequestedAmount",
                table: "FeedingHistory",
                newName: "Amount");

            migrationBuilder.RenameColumn(
                name: "WaterLevelPercentage",
                table: "DeviceStatuses",
                newName: "WaterLevel");

            migrationBuilder.RenameColumn(
                name: "LastRequestedAmount",
                table: "DeviceStatuses",
                newName: "FoodLevel");
        }
    }
}
