using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Controle_de_Reuniões.Migrations
{
    /// <inheritdoc />
    public partial class AdicionadoReservas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HorarioDisponivel",
                table: "Salas");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Salas",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "Ativa",
                table: "Salas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Salas",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Reservas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SalaId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Responsavel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Gerencia = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Assunto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Cancelada = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reservas_Salas_SalaId",
                        column: x => x.SalaId,
                        principalTable: "Salas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_DataInicio",
                table: "Reservas",
                column: "DataInicio");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_SalaId_DataInicio_DataFim",
                table: "Reservas",
                columns: new[] { "SalaId", "DataInicio", "DataFim" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reservas");

            migrationBuilder.DropColumn(
                name: "Ativa",
                table: "Salas");

            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Salas");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Salas",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<DateTime>(
                name: "HorarioDisponivel",
                table: "Salas",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
