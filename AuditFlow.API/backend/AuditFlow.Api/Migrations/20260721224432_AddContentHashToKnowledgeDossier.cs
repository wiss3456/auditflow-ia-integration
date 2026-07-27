using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuditFlow.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddContentHashToKnowledgeDossier : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContentHash",
                table: "knowledge_dossiers",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastGeneratedAt",
                table: "knowledge_dossiers",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentHash",
                table: "knowledge_dossiers");

            migrationBuilder.DropColumn(
                name: "LastGeneratedAt",
                table: "knowledge_dossiers");
        }
    }
}
