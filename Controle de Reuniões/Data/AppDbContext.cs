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
    }
}
