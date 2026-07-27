using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuditFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVerificationTestExtraFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Action",
                table: "verification_tests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Auditor",
                table: "verification_tests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Comments",
                table: "verification_tests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsNonConformity",
                table: "verification_tests",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TestNumber",
                table: "verification_tests",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Action",
                table: "verification_tests");

            migrationBuilder.DropColumn(
                name: "Auditor",
                table: "verification_tests");

            migrationBuilder.DropColumn(
                name: "Comments",
                table: "verification_tests");

            migrationBuilder.DropColumn(
                name: "IsNonConformity",
                table: "verification_tests");

            migrationBuilder.DropColumn(
                name: "TestNumber",
                table: "verification_tests");
        }
    }
}
