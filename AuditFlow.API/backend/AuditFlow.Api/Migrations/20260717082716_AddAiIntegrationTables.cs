using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuditFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAiIntegrationTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "knowledge_dossiers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    DimensionKey = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Summary = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_knowledge_dossiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_knowledge_dossiers_missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "risk_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<string>(type: "text", nullable: false),
                    ObjetAuditable = table.Column<string>(type: "text", nullable: false),
                    SousObjetAuditable = table.Column<string>(type: "text", nullable: false),
                    ObjectifOperationnelControle = table.Column<string>(type: "text", nullable: false),
                    Risque = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    BonnePratique = table.Column<string>(type: "text", nullable: false),
                    Likelihood = table.Column<string>(type: "text", nullable: false),
                    Impact = table.Column<string>(type: "text", nullable: false),
                    Evaluation = table.Column<string>(type: "text", nullable: false),
                    TypeControle = table.Column<string>(type: "text", nullable: false),
                    DecisionStatus = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_risk_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_risk_entries_missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "knowledge_articles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KnowledgeDossierId = table.Column<Guid>(type: "uuid", nullable: false),
                    ArticleId = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Content = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CitationsJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_knowledge_articles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_knowledge_articles_knowledge_dossiers_KnowledgeDossierId",
                        column: x => x.KnowledgeDossierId,
                        principalTable: "knowledge_dossiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "verification_tests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    RiskEntryId = table.Column<Guid>(type: "uuid", nullable: true),
                    Tache = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Objectif = table.Column<string>(type: "text", nullable: false),
                    Methodologie = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    AssignedUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_verification_tests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_verification_tests_missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_verification_tests_risk_entries_RiskEntryId",
                        column: x => x.RiskEntryId,
                        principalTable: "risk_entries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_verification_tests_users_AssignedUserId",
                        column: x => x.AssignedUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_knowledge_articles_KnowledgeDossierId",
                table: "knowledge_articles",
                column: "KnowledgeDossierId");

            migrationBuilder.CreateIndex(
                name: "IX_knowledge_dossiers_MissionId",
                table: "knowledge_dossiers",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_risk_entries_DecisionStatus",
                table: "risk_entries",
                column: "DecisionStatus");

            migrationBuilder.CreateIndex(
                name: "IX_risk_entries_MissionId",
                table: "risk_entries",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_verification_tests_AssignedUserId",
                table: "verification_tests",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_verification_tests_MissionId",
                table: "verification_tests",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_verification_tests_RiskEntryId",
                table: "verification_tests",
                column: "RiskEntryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "knowledge_articles");

            migrationBuilder.DropTable(
                name: "verification_tests");

            migrationBuilder.DropTable(
                name: "knowledge_dossiers");

            migrationBuilder.DropTable(
                name: "risk_entries");
        }
    }
}
