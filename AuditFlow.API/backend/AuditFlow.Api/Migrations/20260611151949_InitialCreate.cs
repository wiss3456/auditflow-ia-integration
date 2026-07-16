using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuditFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Phone = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    Role = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    StatusLabel = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Team = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "missions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Client = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Objective = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OwnerUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Reference = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Scope = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Site = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_missions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_missions_users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "follow_up_actions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActionDetail = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    AssignedUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    BoardStatus = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeadlineLabel = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Evaluation = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    MissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerDisplayName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Recommendation = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    RecommendationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RecommendationStatus = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Remarks = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_follow_up_actions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_follow_up_actions_missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_follow_up_actions_users_AssignedUserId",
                        column: x => x.AssignedUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_follow_up_actions_users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_actions_AssignedUserId",
                table: "follow_up_actions",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_actions_BoardStatus",
                table: "follow_up_actions",
                column: "BoardStatus");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_actions_CreatedByUserId",
                table: "follow_up_actions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_actions_MissionId",
                table: "follow_up_actions",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_actions_RecommendationStatus",
                table: "follow_up_actions",
                column: "RecommendationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_follow_up_actions_Status",
                table: "follow_up_actions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_missions_OwnerUserId",
                table: "missions",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_missions_Reference",
                table: "missions",
                column: "Reference",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "follow_up_actions");

            migrationBuilder.DropTable(
                name: "missions");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
