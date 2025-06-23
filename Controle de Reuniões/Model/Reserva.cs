using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Controle_de_Reuniões.Model
{
    public class Reserva
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string SalaId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Responsavel { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Gerencia { get; set; } = string.Empty;

        [Required]
        public DateTime DataInicio { get; set; }

        [Required]
        public DateTime DataFim { get; set; }

        [StringLength(500)]
        public string? Assunto { get; set; }

        [StringLength(1000)]
        public string? Observacoes { get; set; }

        public DateTime DataCriacao { get; set; } = DateTime.Now;

        public bool Cancelada { get; set; } = false;

        // Relacionamento com a sala
        [ForeignKey("SalaId")]
        public virtual Sala? Sala { get; set; }
    }
} 