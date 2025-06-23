using Controle_de_Reuniões.Model;
using Microsoft.EntityFrameworkCore;

namespace Controle_de_Reuniões.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Sala> Salas { get; set; }
        public DbSet<Reserva> Reservas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração do relacionamento Sala-Reserva
            modelBuilder.Entity<Reserva>()
                .HasOne(r => r.Sala)
                .WithMany(s => s.Reservas)
                .HasForeignKey(r => r.SalaId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configuração de índices para melhor performance
            modelBuilder.Entity<Reserva>()
                .HasIndex(r => new { r.SalaId, r.DataInicio, r.DataFim });

            modelBuilder.Entity<Reserva>()
                .HasIndex(r => r.DataInicio);
        }
    }
}
