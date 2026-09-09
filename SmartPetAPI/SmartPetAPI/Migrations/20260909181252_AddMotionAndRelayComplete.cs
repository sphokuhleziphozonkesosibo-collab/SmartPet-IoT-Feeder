using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPetAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddMotionAndRelayComplete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "MotionDetected",
                table: "DeviceStatuses",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MotionDetected",
                table: "DeviceStatuses");
        }
    }
}
