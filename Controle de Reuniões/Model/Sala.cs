using System.ComponentModel.DataAnnotations;

namespace Controle_de_Reuniões.Model
{
    public class Sala
    {
        [Key]
        public string Id { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [Range(1, 100)]
        public int NumeroDeLugares { get; set; }

        [Required]
        public Setores Setor { get; set; }

        [StringLength(500)]
        public string? Descricao { get; set; }

        public bool Ativa { get; set; } = true;

        // Relacionamento com as reservas
        public virtual ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
    }
}